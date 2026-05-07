import React, { useEffect, useState } from "react"
import { ShieldCheck, FileDown, Leaf, TrendingDown, DollarSign, Link as LinkIcon } from "lucide-react"
import { downloadEsgReport, timestampLedger, fetchSystemMetrics } from "@/lib/api"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { motion } from "framer-motion"

export default function CarbonLedger() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [metrics, setMetrics] = useState({
    totalEmissionsKg: 145020.50,
    emissionsReducedKg: 12450.25,
    carbonCreditsEarned: 12.45,
    riskLevel: "MODERATE"
  })

  useEffect(() => {
    fetchSystemMetrics().then(m => {
      setMetrics({
        totalEmissionsKg: m.total_predictions * 450,
        emissionsReducedKg: m.pending_feedback_labels * 5,
        carbonCreditsEarned: (m.pending_feedback_labels * 5) / 100,
        riskLevel: "MODERATE"
      })
      setTimeout(() => setIsReady(true), 200)
    }).catch(console.error)
  }, [])

  const [txHash, setTxHash] = useState<string | null>(null)
  const [isPinning, setIsPinning] = useState(false)

  const chartData = [
    { month: 'JAN', credits: 1.2 },
    { month: 'FEB', credits: 1.8 },
    { month: 'MAR', credits: 2.1 },
    { month: 'APR', credits: 1.9 },
    { month: 'MAY', credits: 2.4 },
    { month: 'JUN', credits: 3.05 },
  ]

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      await downloadEsgReport({
        company_name: "NeuralCarbon Energy Facility",
        report_period: "Q3 2026",
        total_emissions_kg: metrics.totalEmissionsKg,
        emissions_reduced_kg: metrics.emissionsReducedKg,
        carbon_credits_earned: metrics.carbonCreditsEarned,
        risk_level: metrics.riskLevel
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="glass-panel p-8 rounded-[2.5rem] flex flex-col h-full min-h-[500px]"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black premium-gradient-text tracking-tight">Ledger</h2>
            <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Immutability Active</p>
          </div>
        </div>
        
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="p-3 bg-white text-black hover:bg-neutral-200 rounded-xl transition-all disabled:opacity-50"
          title="Export ESG Report"
        >
          <FileDown size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <LedgerStat icon={<Leaf size={12} />} label="Total" value={metrics.totalEmissionsKg.toLocaleString()} unit="kg" />
        <LedgerStat icon={<TrendingDown size={12} />} label="Saved" value={metrics.emissionsReducedKg.toLocaleString()} unit="kg" color="text-primary" />
        <LedgerStat icon={<DollarSign size={12} />} label="Value" value={(metrics.carbonCreditsEarned * 45).toFixed(0)} unit="$" />
        <LedgerStat icon={<LinkIcon size={12} />} label="Chain" value="99.2" unit="%" />
      </div>

      <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 p-5 flex flex-col">
        <h3 className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-6">Historical Credits</h3>
        <div className="flex-1 min-h-[150px]">
          {isReady && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#020b09', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="credits" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : 'rgba(16, 185, 129, 0.2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center text-[8px] font-bold text-neutral-500 uppercase tracking-widest">
           <span>Jan</span>
           <span>Jun</span>
        </div>
      </div>
    </motion.div>
  )
}

function LedgerStat({ icon, label, value, unit, color = "text-foreground" }: { icon: React.ReactNode, label: string, value: string, unit: string, color?: string }) {
  return (
    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
      <div className="flex items-center gap-1.5 text-neutral-600 mb-1">
        {icon}
        <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className={`text-sm font-black tracking-tighter ${color}`}>
        {value}<span className="text-[7px] text-neutral-700 uppercase font-bold ml-0.5">{unit}</span>
      </div>
    </div>
  )
}
