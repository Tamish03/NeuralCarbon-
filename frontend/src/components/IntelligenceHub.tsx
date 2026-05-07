"use client"
import React, { useEffect, useState } from "react"
import { fetchSystemMetrics, fetchDriftStatus } from "@/lib/api"
import { motion } from "framer-motion"
import { Activity, Zap, Binary, BrainCircuit, History, ShieldAlert } from "lucide-react"

interface SystemMetrics {
  total_predictions: number;
  total_drift_events: number;
  pending_feedback_labels: number;
  total_model_emissions_g: number;
  avg_prediction_co2: number;
}

export default function IntelligenceHub() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [drift, setDrift] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [m, d] = await Promise.all([fetchSystemMetrics(), fetchDriftStatus()])
        setMetrics(m)
        setDrift(d)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 10000) // refresh every 10s
    return () => clearInterval(interval)
  }, [])

  if (loading || !metrics) return <div className="glass-panel p-6 rounded-xl animate-pulse h-64"></div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass-panel p-8 rounded-3xl relative group"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black premium-gradient-text tracking-tight">Intelligence Hub</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Autonomous Governance v2.4</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Model Online</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard icon={<Activity className="w-4 h-4 text-primary" />} label="Inferences" value={metrics.total_predictions} />
        <MetricCard 
          icon={<Zap className="w-4 h-4 text-amber-400" />} 
          label="AI Carbon Cost" 
          value={metrics.total_model_emissions_g.toFixed(5)} 
          unit="g" 
        />
        <MetricCard icon={<Binary className="w-4 h-4 text-blue-400" />} label="Active Labels" value={metrics.pending_feedback_labels} />
        <MetricCard 
          icon={<History className="w-4 h-4 text-red-400" />} 
          label="Drift Alarms" 
          value={metrics.total_drift_events} 
          urgent={metrics.total_drift_events > 0}
        />
      </div>

      {/* Trust & Drift Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Retraining Pipeline</h3>
            <span className="text-[10px] font-bold text-primary">{(Math.min((metrics.pending_feedback_labels / 200) * 100, 100)).toFixed(1)}%</span>
          </div>
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((metrics.pending_feedback_labels / 200) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            ></motion.div>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
            Accumulating physical ground-truth labels for the next active learning cycle. 
            Targeting <span className="text-white font-bold">200</span> unique data points to trigger automated weight optimization.
          </p>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl bg-primary/[0.03] border border-primary/10 relative group-hover:border-primary/30 transition-colors">
          <div className="absolute top-4 right-4 opacity-10">
            <ShieldAlert className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Governance Logic</h3>
          <p className="text-sm text-neutral-300 leading-relaxed font-medium relative z-10">
            {drift?.drift_detected 
              ? "System drift detected in RH/AT variance. Automated retraining scheduled for next window."
              : metrics.total_drift_events > 0 
                ? "Recent drift history logged. MAPIE confidence interval width adjusted to +14% variance."
                : "Operational parameters stable. Model confidence at 90% (Conformal Prediction)."}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function MetricCard({ icon, label, value, unit = "", urgent = false }: { icon: React.ReactNode, label: string, value: any, unit?: string, urgent?: boolean }) {
  return (
    <div className="group/metric p-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all duration-300 h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 text-neutral-500 mb-3">
        {icon}
        <span className="text-[8px] uppercase tracking-[0.15em] font-black group-hover/metric:text-neutral-300 transition-colors whitespace-nowrap">{label}</span>
      </div>
      <div className={`text-2xl font-black tracking-tighter truncate ${urgent ? 'text-status-high animate-pulse' : 'text-foreground'}`}>
        {value} <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">{unit}</span>
      </div>
    </div>
  )
}

