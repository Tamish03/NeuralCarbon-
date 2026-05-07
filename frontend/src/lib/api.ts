const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"

async function apiRequest(endpoint: string, method = "GET", body?: any, isBlob = false) {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`)
  
  return isBlob ? response.blob() : response.json()
}

export const fetchPrediction = (features: Record<string, number>) => apiRequest("/predict/", "POST", features)
export const fetchExplanation = (features: Record<string, number>) => apiRequest("/explain/", "POST", features)
export const fetchPrescription = (features: Record<string, number>, targetReduction = 5.0, maxScenarios = 3) => 
  apiRequest("/prescribe/", "POST", { ...features, target_reduction_pct: targetReduction, max_scenarios: maxScenarios })

export const fetchDriftStatus = () => apiRequest("/drift/status")
export const fetchPolicySimulation = (inputs: Record<string, number>) => 
  apiRequest("/simulate/policy/", "POST", {
    base_AT: inputs.AT,
    base_V: inputs.V,
    base_AP: inputs.AP,
    base_RH: inputs.RH,
    v_sweep_min: Math.max(10, inputs.V - 10),
    v_sweep_max: Math.min(60, inputs.V + 10),
    v_sweep_steps: 20
  })
export const fetchWeather = () => apiRequest("/weather/")
export const submitFeedback = (feedback: any) => apiRequest("/feedback/", "POST", feedback)
export const fetchSystemMetrics = () => apiRequest("/metrics/")
export const timestampLedger = (data: any) => apiRequest("/ledger/timestamp", "POST", data)

export const downloadEsgReport = async (data: any) => {
  const blob = await apiRequest("/report/esg", "POST", data, true)
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `ESG_Report_${Date.now()}.pdf`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
