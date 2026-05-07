import React, { useState } from "react"
import { DatabaseZap, UploadCloud, CheckCircle2 } from "lucide-react"
import { submitFeedback } from "@/lib/api"

export default function ActiveLearningQueue({ currentInputs }: { currentInputs?: Record<string, number> }) {
  const [actualCo2, setActualCo2] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")
  const [feedbackId, setFeedbackId] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actualCo2 || isNaN(Number(actualCo2))) return

    setStatus("submitting")
    try {
      const payload = currentInputs ? { true_co2_kg: Number(actualCo2), ...currentInputs } : { true_co2_kg: Number(actualCo2), AT: 0, V: 0, AP: 0, RH: 0 }
      const res = await submitFeedback(payload)
      setFeedbackId(res.feedback_id.slice(0, 8))
      setStatus("success")
      setActualCo2("")
      setTimeout(() => setStatus("idle"), 5000)
    } catch (err) {
      console.error(err)
      setStatus("idle")
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
          <DatabaseZap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Active Learning Ingestion</h2>
          <p className="text-xs text-neutral-400">Ground-truth feedback loop</p>
        </div>
      </div>

      <div className="bg-black/20 p-4 rounded-lg border border-white/5">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
            <h3 className="text-white font-medium">Ingestion Successful</h3>
            <p className="text-sm text-neutral-400 mt-1">
              Data packet <span className="font-mono text-xs bg-white/10 px-1 rounded">{feedbackId}</span> sent to retraining queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Measured CO₂ Emission (kg)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={actualCo2}
                  onChange={(e) => setActualCo2(e.target.value)}
                  placeholder="e.g. 452.30"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50"
                  required
                />
                <button
                  type="submit"
                  disabled={status === "submitting" || !actualCo2}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <UploadCloud className="w-4 h-4" />
                  {status === "submitting" ? "Sending..." : "Submit"}
                </button>
              </div>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Submitting physical sensor readings helps calibrate the model via continuous concept drift monitoring and conformal prediction updates.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
