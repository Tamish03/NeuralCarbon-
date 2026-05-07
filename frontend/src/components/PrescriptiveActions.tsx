"use client"
import React, { useEffect, useState } from "react"
import { fetchPrescription } from "@/lib/api"
import { motion } from "framer-motion"
import { ArrowRight, Settings2 } from "lucide-react"

interface Scenario {
  scenario_id: number;
  changes: Record<string, number>;
  predicted_co2: number;
  reduction_achieved_pct: number;
  feasibility_score: string;
}

interface PrescriptiveData {
  original_co2: number;
  target_co2: number;
  scenarios: Scenario[];
}

export default function PrescriptiveActions({ currentInputs }: { currentInputs: Record<string, number> }) {
  const [data, setData] = useState<PrescriptiveData | null>(null)
  
  useEffect(() => {
    // Request a 5% reduction counterfactual
    fetchPrescription(currentInputs, 5.0, 3).then(setData).catch(console.error)
  }, [currentInputs])

  if (!data) return <div className="glass-panel p-6 rounded-xl animate-pulse h-48 mt-6"></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-xl mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-lg">DiCE Counterfactual Prescriptions</h3>
      </div>
      
      <p className="text-sm text-neutral-400 mb-4">
        To reduce CO₂ emissions from <span className="text-foreground font-semibold">{data.original_co2.toFixed(1)}</span> to target <span className="text-status-low font-semibold">{data.target_co2.toFixed(1)}</span> kg/h, apply one of the following operational scenarios:
      </p>

      <div className="space-y-4">
        {data.scenarios.map((scenario, idx: number) => (
          <div key={scenario.scenario_id} className="p-4 rounded-lg bg-black/20 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Adjust Parameters:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(scenario.changes).map(([key, val]) => (
                    <span key={key} className="text-xs px-2 py-1 rounded bg-white/10 font-mono">
                      {key}: {Number(val) > 0 ? '+' : ''}{val}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 md:ml-auto">
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">New CO₂</p>
                <p className="font-semibold text-status-low">{scenario.predicted_co2} kg</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600 hidden md:block" />
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Feasibility</p>
                <p className={`text-xs font-bold ${
                  scenario.feasibility_score === 'High' ? 'text-status-low' : 
                  scenario.feasibility_score === 'Medium' ? 'text-status-med' : 'text-status-high'
                }`}>{scenario.feasibility_score}</p>
              </div>
              <button className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-md transition-colors">
                Apply
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </motion.div>
  )
}
