"use client"
import React, { useEffect, useState } from "react"
import { fetchPrediction, fetchDriftStatus } from "@/lib/api"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Activity } from "lucide-react"

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
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="glass-panel p-8 rounded-2xl md:col-span-2 relative overflow-hidden flex flex-col group/card"
      >
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isCritical ? 'bg-status-high shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-status-low shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#10b981]"></span>
              <h3 className="text-neutral-400 font-bold text-xs uppercase tracking-[0.2em]">Real-time Telemetry</h3>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black premium-gradient-text tracking-tighter">
                {data?.co2_kg?.toFixed(1)}
              </span>
              <span className="text-neutral-500 font-medium text-sm">kg / hr</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-2">System Risk</p>
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-500 ${
              isCritical 
                ? 'bg-status-high/10 text-status-high border border-status-high/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                : 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
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
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay: 0.1 }} 
        className="glass-panel p-8 rounded-2xl relative"
      >
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-neutral-400 font-bold text-xs uppercase tracking-widest">ADWIN Detector</h3>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Drift Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${drift?.drift_detected ? 'bg-status-high animate-ping' : 'bg-status-low'}`}></span>
              <span className={`text-xs font-black tracking-widest ${drift?.drift_detected ? 'text-status-high' : 'text-status-low'}`}>
                {drift?.drift_detected ? 'ACTIVE' : 'STABLE'}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-neutral-500 font-bold">Severity</span>
            <span className={`text-xs font-black tracking-widest ${drift?.severity === 'HIGH' ? 'text-status-high' : 'text-neutral-300'}`}>
              {drift?.severity}
            </span>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[11px] text-neutral-400 leading-relaxed italic font-medium">
              "{drift?.recommendation}"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
