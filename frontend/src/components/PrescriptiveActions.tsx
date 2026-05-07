"use client"
import React, { useEffect, useState } from "react"
import { fetchPrescription } from "@/lib/api"
import { motion } from "framer-motion"
import { Settings2, Zap } from "lucide-react"

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
    fetchPrescription(currentInputs, 5.0, 3).then(setData).catch(console.error)
  }, [currentInputs])

  if (!data) return <div className="glass-panel p-6 rounded-3xl animate-pulse h-[600px]"></div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.2 }} 
      className="glass-panel p-8 rounded-[2.5rem] flex flex-col h-full min-h-[600px]"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black premium-gradient-text tracking-tight">Prescription Studio</h2>
            <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Counterfactual Optimization</p>
          </div>
        </div>
      </div>

      <div className="bg-black/30 rounded-2xl border border-white/5 p-6 mb-8 flex justify-between items-center">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Base Baseline</span>
          <p className="text-xl font-black tracking-tight">{data.original_co2.toFixed(1)} <span className="text-[10px] text-neutral-700 uppercase font-bold">KG/H</span></p>
        </div>
        <div className="h-8 w-px bg-white/5"></div>
        <div className="space-y-1 text-right">
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">Target Reduction</span>
          <p className="text-xl font-black tracking-tight text-primary">-{((1 - data.target_co2/data.original_co2)*100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {data.scenarios.map((scenario, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + (idx * 0.1) }}
            className="group/scenario relative p-6 bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-500 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="text-[10px] font-black text-neutral-700 uppercase">Step 0{idx + 1}</div>
              <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase ${
                scenario.feasibility_score === 'High' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {scenario.feasibility_score}
              </div>
            </div>

            <div className="space-y-4 mb-auto">
              {Object.entries(scenario.changes).map(([feat, val]) => (
                <div key={feat} className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{feat}</span>
                  <span className={`text-xs font-black tracking-tighter ${val > 0 ? 'text-primary' : 'text-rose-400'}`}>
                    {val > 0 ? '+' : ''}{Number(val).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-white/5">
               <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Predicted Output</p>
               <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white tracking-tighter">{scenario.predicted_co2.toFixed(1)}</span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">kg</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
