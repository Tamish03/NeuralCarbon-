"use client"
import React, { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import LiveTelemetry from "@/components/LiveTelemetry"
import ExplainabilityPanel from "@/components/ExplainabilityPanel"
import PrescriptiveActions from "@/components/PrescriptiveActions"
import PolicySimulator from "@/components/PolicySimulator"
import CarbonLedger from "@/components/CarbonLedger"
import ActiveLearningQueue from "@/components/ActiveLearningQueue"
import IntelligenceHub from "@/components/IntelligenceHub"
import { fetchWeather } from "@/lib/api"
import { CloudRainWind, Cpu } from "lucide-react"

export default function Home() {
  const [currentInputs, setCurrentInputs] = useState<Record<string, number> | null>(null)
  const [location, setLocation] = useState<string>("")

  useEffect(() => {
    fetchWeather().then(res => {
      setCurrentInputs({
        AT: res.AT,
        AP: res.AP,
        RH: res.RH,
        V: 40.2 
      })
      setLocation(res.location)
    }).catch(err => {
      console.warn("Sensor sync fallback:", err)
      setCurrentInputs({
        AT: 24.5,
        AP: 1013.25,
        RH: 55.0,
        V: 40.2
      })
      setLocation("Sensor Hub (Local)")
    })
  }, [])

  if (!currentInputs) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-neutral-500 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
            Establishing Neural Link...
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase tracking-widest">
              Live Production
            </div>
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
          <h1 className="text-4xl font-black premium-gradient-text tracking-tighter">Command Center</h1>
          <p className="text-neutral-600 font-bold text-[9px] uppercase tracking-[0.4em] pl-0.5">Turbine Unit: CX-440-ALPH</p>
        </div>
        
        <div className="flex items-center gap-6 px-6 py-3 rounded-[1.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <CloudRainWind className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Environment</p>
              <p className="text-xs font-bold text-neutral-200">{location}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-white/5"></div>
          <div>
             <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Ambient Temp</p>
             <p className="text-lg font-black text-primary">{currentInputs.AT}<span className="text-[10px] ml-0.5 opacity-50">°C</span></p>
          </div>
        </div>
      </div>

      <section id="control-center" className="space-y-6">
        <div className="flex items-center gap-3">
           <Cpu className="w-3 h-3 text-primary" />
           <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-500">Neural Telemetry & Explainability</h3>
        </div>
        
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12">
            <LiveTelemetry currentInputs={currentInputs} />
          </div>

          <div id="neural-drift" className="col-span-12 lg:col-span-7 flex flex-col">
            <div className="h-full min-h-[500px]">
              <ExplainabilityPanel currentInputs={currentInputs} />
            </div>
          </div>
          <div id="prescriptions" className="col-span-12 lg:col-span-5 flex flex-col">
            <div className="h-full min-h-[500px]">
              <PrescriptiveActions currentInputs={currentInputs} />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 flex flex-col">
             <div className="h-full min-h-[500px]">
               <PolicySimulator currentInputs={currentInputs} />
             </div>
          </div>
          <div id="esg-ledger" className="col-span-12 lg:col-span-4 flex flex-col">
             <div className="h-full min-h-[500px]">
               <CarbonLedger />
             </div>
          </div>
        </div>
      </section>

      <section id="compliance" className="mt-12 pt-12 border-t border-white/5 space-y-8">
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1 min-w-0">
             <div className="mb-8">
                <h3 className="text-2xl font-black text-neutral-200 tracking-tight">Intelligence Nexus</h3>
                <p className="text-neutral-500 text-xs font-medium">System-wide auditing and model performance tracking.</p>
             </div>
             <IntelligenceHub />
          </div>
          <div className="w-full xl:w-96 flex flex-col">
             <div className="mb-8 invisible hidden xl:block">spacer</div>
             <ActiveLearningQueue currentInputs={currentInputs} />
          </div>
        </div>
      </section>
      
      <footer className="mt-20 py-10 flex flex-col items-center gap-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="flex items-center gap-3 opacity-20">
           <div className="w-1 h-1 rounded-full bg-primary"></div>
           <p className="text-[9px] font-black uppercase tracking-[0.8em] text-neutral-300">NeuralCarbon Intelligence Pipeline</p>
           <div className="w-1 h-1 rounded-full bg-primary"></div>
        </div>
      </footer>
    </Layout>
  )
}
