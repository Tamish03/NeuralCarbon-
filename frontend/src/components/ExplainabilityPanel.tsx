"use client"
import React, { useEffect, useState } from "react"
import { fetchExplanation } from "@/lib/api"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface Contribution {
  feature: string;
  value: number;
  contribution: number;
}

interface ExplanationData {
  base_value: number;
  predicted_value: number;
  contributions: Contribution[];
  top_driver: string;
  lime_top_driver: string;
  agreement_score: number;
  direction: string;
}

export default function ExplainabilityPanel({ currentInputs }: { currentInputs: Record<string, number> }) {
  const [data, setData] = useState<ExplanationData | null>(null)
  
  useEffect(() => {
    fetchExplanation(currentInputs).then(setData).catch(console.error)
  }, [currentInputs])

  if (!data) return <div className="glass-panel p-6 rounded-xl animate-pulse h-64 mt-6"></div>

  // Format data for recharts
  const chartData = data.contributions.map((c) => ({
    name: c.feature,
    value: c.contribution,
    isPositive: c.contribution > 0
  })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-xl mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-medium text-lg">SHAP Explainability</h3>
          <p className="text-sm text-neutral-400">Real-time driver analysis for current prediction</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Top Driver (SHAP)</p>
          <p className="font-bold text-primary">{data.top_driver}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
              LIME: {data.lime_top_driver}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${data.agreement_score >= 0.8 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
              Agreement: {(data.agreement_score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} />
            <Tooltip 
              cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
              contentStyle={{ backgroundColor: 'rgba(2, 44, 34, 0.95)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}
              itemStyle={{ color: '#ecfdf5' }}
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              formatter={(val: any) => [typeof val === 'number' ? val.toFixed(3) : val, "SHAP Value"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.isPositive ? '#ef4444' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
