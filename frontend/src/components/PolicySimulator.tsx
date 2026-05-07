"use client"
import React, { useEffect, useState } from "react"
import { fetchPolicySimulation } from "@/lib/api"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts"
import { Target } from "lucide-react"

interface SimulationResult {
  v_value: number;
  predicted_co2: number;
  risk_level: string;
}

export default function PolicySimulator({ currentInputs }: { currentInputs: Record<string, number> }) {
  const [data, setData] = useState<{ base_co2: number, optimal_v: number, results: SimulationResult[] } | null>(null)
  
  useEffect(() => {
    fetchPolicySimulation(currentInputs).then(setData).catch(console.error)
  }, [currentInputs])

  if (!data) return <div className="glass-panel p-6 rounded-xl animate-pulse h-64 mt-6"></div>

  // Find optimal point for reference line
  const minPoint = data.results.reduce((prev, curr) => (prev.predicted_co2 < curr.predicted_co2 ? prev : curr))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-xl mt-6 lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-lg">Policy Simulator: Vacuum Optimization Sweep</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Optimal Vacuum</p>
          <p className="font-bold text-status-low">{minPoint.v_value.toFixed(1)} cmHg</p>
        </div>
      </div>
      
      <p className="text-sm text-neutral-400 mb-6">
        Simulating non-linear effects of Vacuum (V) on CO₂ output under current environmental conditions.
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.results} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.08)" vertical={false} />
            <XAxis 
              dataKey="v_value" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              tick={{ fill: '#a3a3a3', fontSize: 12 }} 
              tickFormatter={(val) => val.toFixed(0)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              dataKey="predicted_co2" 
              domain={['auto', 'auto']} 
              tick={{ fill: '#a3a3a3', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(16, 185, 129, 0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ backgroundColor: 'rgba(2, 44, 34, 0.95)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}
              itemStyle={{ color: '#ecfdf5' }}
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              formatter={(val: any) => [typeof val === 'number' ? val.toFixed(2) + " kg" : val, "Predicted CO₂"]}
              labelFormatter={(label: any) => `Vacuum: ${Number(label).toFixed(1)} cmHg`}
            />
            <ReferenceLine x={currentInputs.V} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Current State', fill: '#f59e0b', fontSize: 10 }} />
            <ReferenceLine x={minPoint.v_value} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'bottom', value: 'Optimal', fill: '#10b981', fontSize: 10 }} />
            
            <Line 
              type="monotone" 
              dataKey="predicted_co2" 
              stroke="#14b8a6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#14b8a6', stroke: '#022c22', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
