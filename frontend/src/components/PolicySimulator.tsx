"use client"
import React, { useEffect, useState } from "react"
import { fetchPolicySimulation } from "@/lib/api"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { motion } from "framer-motion"

interface PolicyResult {
  v_value: number;
  predicted_co2: number;
  risk_level: string;
}

interface PolicyData {
  results: PolicyResult[];
  base_co2: number;
  optimal_v: number;
}

export default function PolicySimulator({ currentInputs }: { currentInputs: Record<string, number> }) {
  const [data, setData] = useState<PolicyData | null>(null)
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    fetchPolicySimulation(currentInputs).then(res => {
      setData(res)
      setTimeout(() => setIsReady(true), 100)
    }).catch(console.error)
  }, [currentInputs])

  if (!data) return <div className="glass-panel p-6 rounded-3xl animate-pulse h-[500px]"></div>

  const minPoint = data.results.reduce((min: PolicyResult, p: PolicyResult) => 
    p.predicted_co2 < min.predicted_co2 ? p : min, data.results[0])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass-panel p-8 rounded-[2.5rem] flex flex-col h-full min-h-[500px] relative overflow-hidden"
    >
      {/* Header Section */}
      <div className="mb-6 relative z-10">
        <h2 className="text-2xl font-black premium-gradient-text tracking-tight leading-tight">Policy Simulator</h2>
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] mt-1">Vacuum Optimization Sweep</p>
      </div>
      
      {/* Chart Section - Growing to fill space */}
      <div className="flex-1 w-full min-h-[300px] -ml-6">
        {isReady && (
          <ResponsiveContainer width="105%" height="100%">
            <LineChart data={data.results} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" vertical={false} />
              <XAxis 
                dataKey="v_value" 
                type="number" 
                domain={['dataMin', 'dataMax']} 
                tick={{ fill: '#404040', fontSize: 10, fontWeight: 800 }} 
                tickFormatter={(val) => val.toFixed(0)}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                dataKey="predicted_co2" 
                domain={['dataMin - 0.1', 'dataMax + 0.1']} 
                hide
              />
              <Tooltip 
                cursor={{ stroke: 'rgba(16, 185, 129, 0.2)', strokeWidth: 1 }}
                contentStyle={{ backgroundColor: '#020b09', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', fontSize: '10px' }}
                itemStyle={{ color: '#10b981' }}
                formatter={(val: any) => [val.toFixed(2) + " kg", "CO2 Output"]}
                labelFormatter={(label: any) => `Vacuum: ${Number(label).toFixed(1)} cmHg`}
              />
              <ReferenceLine x={currentInputs.V} stroke="#f59e0b" strokeDasharray="5 5" label={{ position: 'top', value: 'LIVE STATE', fill: '#f59e0b', fontSize: 8, fontWeight: 900, letterSpacing: '0.1em' }} />
              <ReferenceLine x={minPoint.v_value} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'bottom', value: 'OPTIMAL POINT', fill: '#10b981', fontSize: 8, fontWeight: 900, letterSpacing: '0.1em' }} />
              
              <Line 
                type="monotone" 
                dataKey="predicted_co2" 
                stroke="#10b981" 
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#020b09', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Info Section - Fills bottom space */}
      <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-end relative z-10">
        <div className="max-w-md">
          <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
            Non-linear optimization sweep identifies the most carbon-efficient operating pressure. 
            The system recommends a vacuum shift of <span className="text-primary font-bold">{(minPoint.v_value - currentInputs.V).toFixed(1)} cmHg</span> to achieve peak efficiency.
          </p>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest mb-1">Optimum Prediction</p>
           <p className="text-2xl font-black text-primary tracking-tighter">{minPoint.predicted_co2.toFixed(1)}<span className="text-xs ml-1 opacity-50">kg</span></p>
        </div>
      </div>
    </motion.div>
  )
}
