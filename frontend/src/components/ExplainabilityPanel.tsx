"use client"
import React, { useEffect, useState } from "react"
import { fetchExplanation } from "@/lib/api"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Info, Target } from "lucide-react"

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
  const [data, setData] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    fetchExplanation(currentInputs).then(res => {
      setData(res)
      setTimeout(() => setIsReady(true), 250)
    }).catch(console.error)
  }, [currentInputs])

  if (!isReady || !data) {
    return <div className="glass-panel p-6 rounded-3xl animate-pulse h-full min-h-[500px]"></div>
  }

  const chartData = data.contributions.map((c) => ({
    name: c.feature,
    value: c.contribution,
    isPositive: c.contribution > 0
  })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 8)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.1 }} 
      className="glass-panel p-8 rounded-[2.5rem] flex flex-col h-full min-h-[600px] group"
    >
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
             <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-black premium-gradient-text tracking-tight">Neural Attribution</h3>
            <p className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] font-bold">XAI Driver Analysis — SHAP Kernels</p>
          </div>
        </div>
        
        <div className="bg-black/30 px-5 py-3 rounded-2xl border border-white/5">
          <p className="text-[8px] text-neutral-600 uppercase font-black tracking-widest mb-1">Consistency</p>
          <span className={`text-sm font-black ${data.agreement_score >= 0.8 ? 'text-primary' : 'text-amber-500'}`}>
            {(data.agreement_score * 100).toFixed(0)}% Cross-Verify
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1">
        <div className="lg:col-span-3 h-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#737373', fontSize: 9, fontWeight: 800 }} 
                width={70}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: '#020b09', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                itemStyle={{ color: '#ecfdf5' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isPositive ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-primary/20 transition-all flex flex-col justify-between h-1/2">
            <div>
              <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest block mb-2">Dominant Driver</span>
              <p className="text-xl font-black tracking-tighter text-white break-all">{data.top_driver}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-neutral-500">
               <Target className="w-3 h-3" />
               <p className="text-[10px] font-bold">Deviation: {Math.abs(chartData[0].value).toFixed(2)}</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 h-[calc(50%-1rem)]">
            <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest block mb-2">LIME Reference</span>
            <p className="text-xl font-black tracking-tighter text-neutral-500">{data.lime_top_driver}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
