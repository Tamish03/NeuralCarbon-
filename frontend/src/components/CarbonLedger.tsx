import React, { useState } from "react"
import { ShieldCheck, FileDown, Leaf, TrendingDown, DollarSign, Link as LinkIcon, CheckCircle2 } from "lucide-react"
import { downloadEsgReport, timestampLedger } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function CarbonLedger() {
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Mock metrics for the UI
  const metrics = {
    totalEmissionsKg: 145020.50,
    emissionsReducedKg: 12450.25,
    carbonCreditsEarned: 12.45,
    riskLevel: "MODERATE"
  }

  const [txHash, setTxHash] = useState<string | null>(null)
  const [isPinning, setIsPinning] = useState(false)

  const chartData = [
    { month: 'Jan', credits: 1.2 },
    { month: 'Feb', credits: 1.8 },
    { month: 'Mar', credits: 2.1 },
    { month: 'Apr', credits: 1.9 },
    { month: 'May', credits: 2.4 },
    { month: 'Jun', credits: 3.05 },
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
      alert("Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePinLedger = async () => {
    setIsPinning(true)
    try {
      const res = await timestampLedger({
        emissionsReducedKg: metrics.emissionsReducedKg,
        carbonCreditsEarned: metrics.carbonCreditsEarned
      })
      setTxHash(res.transaction_hash)
    } catch (err) {
      console.error(err)
      alert("Failed to pin to ledger")
    } finally {
      setIsPinning(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-green-500/20 transition-all duration-700"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">ESG Compliance Ledger</h2>
            <p className="text-xs text-neutral-400">Verified by Immutable Algorithms</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm transition-colors text-white disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : (
            <>
              <FileDown className="w-4 h-4" />
              Export PDF
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="p-4 bg-black/20 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium">Avoided Emissions</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.emissionsReducedKg.toLocaleString()} <span className="text-sm text-neutral-500 font-normal">kg</span></div>
          </div>
          
          <div className="p-4 bg-black/20 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Credits Earned</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.carbonCreditsEarned.toLocaleString()} <span className="text-sm text-neutral-500 font-normal">CR</span></div>
          </div>
          
          <div className="p-4 bg-black/20 rounded-lg border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">Compliance</span>
              </div>
              <div className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">ON TRACK</div>
            </div>
          </div>
        </div>

        {/* Right Column: Graphs & Blockchain */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-black/20 p-4 rounded-lg border border-white/5 h-48">
            <h3 className="text-xs text-neutral-500 mb-2 uppercase tracking-wider font-semibold">Credit Accumulation (YTD)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  contentStyle={{ backgroundColor: 'rgba(2, 44, 34, 0.9)', borderColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}
                  itemStyle={{ color: '#ecfdf5' }}
                />
                <Bar dataKey="credits" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-emerald-500" />
                  Web3 Ledger Anchoring
                </h3>
                <p className="text-xs text-neutral-400 mt-1">Pin current credits to an immutable blockchain.</p>
              </div>
              <button 
                onClick={handlePinLedger}
                disabled={isPinning || !!txHash}
                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPinning ? "Hashing..." : txHash ? <><CheckCircle2 className="w-4 h-4" /> Anchored</> : "Anchor Data"}
              </button>
            </div>
            {txHash && (
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1">
                <span className="text-xs text-neutral-500">Transaction Hash</span>
                <span className="text-xs font-mono text-emerald-400 break-all">{txHash}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
