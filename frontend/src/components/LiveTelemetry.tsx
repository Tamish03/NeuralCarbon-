"use client"
import React, { useEffect, useState } from "react"
import { fetchPrediction, fetchDriftStatus } from "@/lib/api"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface PredictionData {
  co2_kg: number;
  lower_bound: number;
  upper_bound: number;
  cluster_id: number;
  risk_level: string;
}

interface HistoryPoint {
  time: string;
  co2: number;
}

interface DriftData {
  drift_detected: boolean;
  severity: string;
  recommendation: string;
}

export default function LiveTelemetry({ currentInputs }: { currentInputs: Record<string, number> }) {
  const [data, setData] = useState<PredictionData | null>(null)
  const [drift, setDrift] = useState<DriftData | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const poll = async () => {
      try {
        const [pred, driftRes] = await Promise.all([
          fetchPrediction(currentInputs),
          fetchDriftStatus()
        ])
        setData(pred)
        setDrift(driftRes)
        
        const now = new Date()
        setHistory(prev => {
          const newPoints = [...prev, { time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), co2: pred.co2_kg }]
          if (newPoints.length > 20) newPoints.shift() // Keep last 20 points
          return newPoints
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    
    poll()
    // Poll every 5s to simulate live streaming
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [currentInputs])

  if (loading) return <div className="glass-panel p-6 rounded-xl animate-pulse h-48"></div>

  const isCritical = data?.risk_level === 'CRITICAL' || data?.risk_level === 'HIGH'
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* CO2 Emissions Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl md:col-span-2 relative overflow-hidden flex flex-col">
        <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-status-high' : 'bg-status-low'}`}></div>
        
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-neutral-400 font-medium mb-1">Current CO₂ Output</h3>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-5xl font-bold">{data?.co2_kg?.toFixed(1)}</span>
              <span className="text-neutral-500 mb-1">kg / hour</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-neutral-500 text-sm">Risk Level</p>
            <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider ${
              isCritical ? 'bg-status-high/20 text-status-high border border-status-high/30' : 'bg-primary/20 text-primary border border-primary/30'
            }`}>
              {data?.risk_level}
            </div>
          </div>
        </div>

        {/* Real-time Graph Area */}
        <div className="h-32 mt-4 -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isCritical ? "#ef4444" : "#10b981"} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={isCritical ? "#ef4444" : "#10b981"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(2, 44, 34, 0.9)', borderColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}
                itemStyle={{ color: '#ecfdf5' }}
              />
              <Area type="monotone" dataKey="co2" stroke={isCritical ? "#ef4444" : "#10b981"} strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" animationDuration={500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-sm">
          <div>
            <p className="text-neutral-500">Confidence Interval (MAPIE)</p>
            <p className="font-mono mt-1 text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
              [{data?.lower_bound?.toFixed(1)} - {data?.upper_bound?.toFixed(1)}]
            </p>
          </div>
        </div>
      </motion.div>

      {/* Drift Monitor Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-xl">
        <h3 className="text-neutral-400 font-medium mb-4">ADWIN Concept Drift</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Status</span>
            <span className={`text-sm font-semibold ${drift?.drift_detected ? 'text-status-high' : 'text-status-low'}`}>
              {drift?.drift_detected ? 'DRIFT DETECTED' : 'STABLE'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Severity</span>
            <span className="text-sm">{drift?.severity}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-neutral-400 leading-relaxed">
              {drift?.recommendation}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
