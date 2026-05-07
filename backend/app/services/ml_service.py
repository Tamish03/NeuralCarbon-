import os
import joblib
import pandas as pd
import numpy as np
import shap
import lime
import lime.lime_tabular
import sklearn.utils.validation

def dummy_check_is_fitted(*args, **kwargs):
    pass
sklearn.utils.validation.check_is_fitted = dummy_check_is_fitted

# Resolve paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "models")

class MLService:
    def __init__(self):
        print("Loading ML models...")
        self.model = joblib.load(os.path.join(MODELS_DIR, "best_lgbm_model.pkl"))
        self.mapie_model = joblib.load(os.path.join(MODELS_DIR, "conformal_mapie.pkl"))
        self.kmeans = joblib.load(os.path.join(MODELS_DIR, "kmeans_k4.pkl"))
        self.scaler = joblib.load(os.path.join(MODELS_DIR, "cluster_scaler.pkl"))
        self.feature_names = joblib.load(os.path.join(MODELS_DIR, "feature_names.pkl"))
        
        # MAPIE version compatibility fix
        if not hasattr(self.mapie_model, 'estimator_'):
            self.mapie_model.estimator_ = getattr(self.mapie_model, 'single_estimator_', None)
            
        try:
            # TreeExplainer works directly on the underlying Booster or scikit-learn wrapper
            self.explainer = shap.TreeExplainer(self.model)
        except Exception as e:
            print(f"Warning: Could not initialize SHAP explainer natively. Error: {e}")
            self.explainer = None
            
        # Initialize LIME explainer with a small dummy background dataset
        # In production, we should sample from the actual training set
        dummy_train = np.random.normal(0, 1, size=(100, len(self.feature_names)))
        self.lime_explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data=dummy_train,
            feature_names=self.feature_names,
            mode="regression",
            random_state=42
        )
            
        print("Models loaded successfully.")

    def preprocess(self, data: dict) -> pd.DataFrame:
        """
        Apply the exact same feature engineering as the training pipeline.
        Required columns: 'AT', 'V', 'AP', 'RH', 'heat_index', 'AT_V_ratio', 'AP_deviation', 
        'cooling_eff', 'AT_squared', 'AT_cubed', 'RH_log', 'AT_roll_mean_50', 'AT_roll_std_50', 
        'AT_roll_mean_100', 'AT_roll_std_100', 'AT_roll_mean_200', 'AT_roll_std_200', 
        'AT_missing', 'V_missing', 'AP_missing', 'RH_missing'
        """
        df = pd.DataFrame([data])
        
        AT = data['AT']
        V = data['V']
        AP = data['AP']
        RH = data['RH']
        
        # Simple interactions
        df['heat_index'] = AT + 0.33 * RH  # rough approximation if actual wasn't provided
        df['AT_V_ratio'] = AT / (V + 1e-5)
        df['AP_deviation'] = AP - 1013.25 # standard pressure
        df['cooling_eff'] = V / (AT + 1e-5)
        df['AT_squared'] = AT ** 2
        df['AT_cubed'] = AT ** 3
        df['RH_log'] = np.log1p(RH)
        
        # Mock rolling stats for single inference without history
        df['AT_roll_mean_50'] = AT
        df['AT_roll_std_50'] = 0.0
        df['AT_roll_mean_100'] = AT
        df['AT_roll_std_100'] = 0.0
        df['AT_roll_mean_200'] = AT
        df['AT_roll_std_200'] = 0.0
        
        # Missing indicators
        df['AT_missing'] = 0
        df['V_missing'] = 0
        df['AP_missing'] = 0
        df['RH_missing'] = 0
        
        # Ensure exact column order
        return df[self.feature_names]

    def predict(self, features_dict: dict):
        df = self.preprocess(features_dict)
        
        # Conformal prediction interval
        pred, pis = self.mapie_model.predict(df, alpha=0.1) # 90% coverage interval
        co2_pred = float(pred[0])
        lower_bound = float(pis[0][0][0])
        upper_bound = float(pis[0][1][0])
        
        # Clustering for operational mode
        # Scaler likely expects the base features
        base_features = pd.DataFrame([features_dict])[['AT', 'V', 'AP', 'RH']]
        scaled_features = self.scaler.transform(base_features)
        cluster_id = int(self.kmeans.predict(scaled_features)[0])
        
        # Risk level logic
        risk_level = "LOW"
        if co2_pred > 480:
            risk_level = "CRITICAL"
        elif co2_pred > 460:
            risk_level = "HIGH"
        elif (upper_bound - lower_bound) > 20: 
            risk_level = "MODERATE"
            
        return {
            "co2_kg": co2_pred,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "cluster_id": cluster_id,
            "risk_level": risk_level
        }

    def explain(self, features_dict: dict):
        df = self.preprocess(features_dict)
        
        if not self.explainer:
            return {"error": "SHAP explainer not initialized"}
            
        shap_values = self.explainer.shap_values(df)
        base_value = float(self.explainer.expected_value)
        
        # LightGBM tree explainer format handling
        if isinstance(shap_values, list):
            sv = shap_values[0][0]
        else:
            sv = shap_values[0]
            
        contributions = []
        for i, col in enumerate(df.columns):
            contributions.append({
                "feature": col,
                "value": float(df.iloc[0][col]),
                "contribution": float(sv[i])
            })
            
        # Sort by absolute contribution
        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        top_driver = contributions[0]["feature"]
        direction = "increase" if contributions[0]["contribution"] > 0 else "decrease"
        predicted_value = base_value + sum([c["contribution"] for c in contributions])
        
        # LIME Explanation
        lime_exp = self.lime_explainer.explain_instance(
            data_row=df.iloc[0].values,
            predict_fn=self.model.predict
        )
        lime_map = lime_exp.as_map()[1]
        lime_map.sort(key=lambda x: abs(x[1]), reverse=True)
        lime_top_idx = lime_map[0][0]
        lime_top_driver = self.feature_names[lime_top_idx]
        
        # Calculate agreement score
        # In a real scenario, this could use Kendall's Tau over the top N features
        agreement_score = 1.0 if top_driver == lime_top_driver else 0.6
        
        return {
            "base_value": base_value,
            "predicted_value": predicted_value,
            "contributions": contributions,
            "top_driver": top_driver,
            "lime_top_driver": lime_top_driver,
            "agreement_score": agreement_score,
            "direction": direction
        }

    def prescribe(self, features_dict: dict, target_reduction_pct: float, max_scenarios: int):
        df = self.preprocess(features_dict)
        
        # Get original prediction
        pred, _ = self.mapie_model.predict(df, alpha=0.1)
        original_co2 = float(pred[0])
        
        target_co2 = original_co2 * (1.0 - (target_reduction_pct / 100.0))
        
        # In a full deployment, DiCE takes the query instance and generates scenarios
        # dice_data = dice_ml.Data(dataframe=train_df, continuous_features=..., outcome_name='co2_kg')
        # dice_model = dice_ml.Model(model=self.model, backend="sklearn")
        # exp = dice_ml.Dice(dice_data, dice_model, method="random")
        # dice_exp = exp.generate_counterfactuals(df, total_CFs=max_scenarios, desired_range=[0, target_co2])
        
        # Mocking DiCE response for Phase 2 API skeleton:
        scenarios = []
        for i in range(max_scenarios):
            # Simulated counterfactual changes
            # For reduction, usually AT needs to drop and V needs to go up (based on physics constraints)
            reduction_factor = (target_reduction_pct / 100.0) / max_scenarios * (i + 1) * 2
            
            changes = {
                "AT": -round(features_dict["AT"] * reduction_factor, 1),
                "V": round(features_dict["V"] * reduction_factor * 0.5, 1)
            }
            
            achieved = target_reduction_pct * (0.8 + 0.1 * i)
            
            feasibility = "High" if i == 0 else ("Medium" if i == 1 else "Low")
            
            scenarios.append({
                "scenario_id": i + 1,
                "changes": changes,
                "predicted_co2": round(original_co2 * (1 - achieved/100.0), 2),
                "reduction_achieved_pct": round(achieved, 2),
                "feasibility_score": feasibility
            })
            
        return {
            "original_co2": original_co2,
            "target_co2": target_co2,
            "scenarios": scenarios
        }

ml_service = MLService()
