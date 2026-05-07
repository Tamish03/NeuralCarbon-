"use client"
import React, { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import LiveTelemetry from "@/components/LiveTelemetry"
import ExplainabilityPanel from "@/components/ExplainabilityPanel"
import PrescriptiveActions from "@/components/PrescriptiveActions"
import PolicySimulator from "@/components/PolicySimulator"
import CarbonLedger from "@/components/CarbonLedger"
import ActiveLearningQueue from "@/components/ActiveLearningQueue"
import { fetchWeather } from "@/lib/api"
import { CloudRainWind } from "lucide-react"

export default function Home() {
  const [currentInputs, setCurrentInputs] = useState<Record<string, number> | null>(null)
  const [location, setLocation] = useState<string>("")

  useEffect(() => {
    // Fetch live environmental telemetry on load
    fetchWeather().then(res => {
      setCurrentInputs({
        AT: res.AT,
        AP: res.AP,
        RH: res.RH,
        V: 40.2 // Vacuum is an operational lever, not weather, so keep static for mock
      })
      setLocation(res.location)
    }).catch(console.error)
  }, [])

  if (!currentInputs) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full animate-pulse text-neutral-500">
          Initializing telemetry streams...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-glow-green">Operational Overview</h1>
          <p className="text-emerald-400/60 mt-1">Real-time intelligence from Gas Turbine Unit 4</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/20 border border-emerald-500/15 text-xs text-emerald-300">
          <CloudRainWind className="w-4 h-4 text-primary" />
          <span>Live Weather: {location} — AT: {currentInputs.AT}°C, RH: {currentInputs.RH}%</span>
        </div>
      </div>
      
      <LiveTelemetry currentInputs={currentInputs} />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-6">
        <ExplainabilityPanel currentInputs={currentInputs} />
        <PrescriptiveActions currentInputs={currentInputs} />
        <PolicySimulator currentInputs={currentInputs} />
        <div className="flex flex-col gap-6">
          <CarbonLedger />
          <ActiveLearningQueue currentInputs={currentInputs} />
        </div>
      </div>
      
    </Layout>
  )
}
