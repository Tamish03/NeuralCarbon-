const API_BASE = "http://localhost:8000/api/v1"

export async function fetchPrediction(features: Record<string, number>) {
  const res = await fetch(`${API_BASE}/predict/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });
  if (!res.ok) throw new Error("Failed to fetch prediction");
  return res.json();
}

export async function fetchExplanation(features: Record<string, number>) {
  const res = await fetch(`${API_BASE}/explain/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });
  if (!res.ok) throw new Error("Failed to fetch explanation");
  return res.json();
}

export async function fetchPrescription(features: Record<string, number>, targetReduction = 10.0, maxScenarios = 3) {
  const res = await fetch(`${API_BASE}/prescribe/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...features, target_reduction_pct: targetReduction, max_scenarios: maxScenarios }),
  });
  if (!res.ok) throw new Error("Failed to fetch prescription");
  return res.json();
}

export async function fetchDriftStatus() {
  const res = await fetch(`${API_BASE}/drift/status`);
  if (!res.ok) throw new Error("Failed to fetch drift status");
  return res.json();
}

export async function fetchPolicySimulation(baseInputs: Record<string, number>, vMin = 35.0, vMax = 75.0) {
  const res = await fetch(`${API_BASE}/simulate/policy/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base_AT: baseInputs.AT,
      base_V: baseInputs.V,
      base_AP: baseInputs.AP,
      base_RH: baseInputs.RH,
      v_sweep_min: vMin,
      v_sweep_max: vMax,
      v_sweep_steps: 20
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch policy simulation");
  return res.json();
}

export async function fetchWeather() {
  const res = await fetch(`${API_BASE}/weather/`);
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}

export async function submitFeedback(payload: any) {
  const res = await fetch(`${API_BASE}/feedback/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return res.json();
}

export async function downloadEsgReport(payload: any) {
  const res = await fetch(`${API_BASE}/report/esg`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to generate ESG report");
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `esg_report_${payload.report_period.replace(' ', '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function timestampLedger(payload: { emissionsReducedKg: number, carbonCreditsEarned: number }) {
  const res = await fetch(`${API_BASE}/ledger/timestamp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to anchor to ledger");
  return res.json();
}
