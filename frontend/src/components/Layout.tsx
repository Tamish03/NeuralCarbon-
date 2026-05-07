import React from "react"
import { Activity, ShieldAlert, Sliders, LayoutDashboard, Leaf, Link as LinkIcon, FileText } from "lucide-react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col md:flex-row text-sm relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-900/15 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-panel border-r border-b md:border-b-0 p-4 flex flex-col gap-8 md:h-screen sticky top-0 z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="p-1.5 bg-primary/20 rounded-lg">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">NeuralCarbon</h1>
            <p className="text-[10px] text-neutral-500 -mt-0.5 tracking-widest uppercase">Intelligence Platform</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-1">
          <NavItem icon={<LayoutDashboard className="w-4 h-4"/>} label="Live Telemetry" active />
          <NavItem icon={<Activity className="w-4 h-4"/>} label="Drift Analysis" />
          <NavItem icon={<Sliders className="w-4 h-4"/>} label="Prescriptive Ops" />
          <NavItem icon={<LinkIcon className="w-4 h-4"/>} label="Blockchain Ledger" />
          <NavItem icon={<FileText className="w-4 h-4"/>} label="ESG Reports" />
          <NavItem icon={<ShieldAlert className="w-4 h-4"/>} label="Alerts" />
        </nav>
        
        <div className="mt-auto hidden md:flex flex-col gap-3 px-2">
          <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs text-emerald-300 font-medium">System Nominal</span>
            </div>
            <p className="text-[10px] text-neutral-500">All 9 endpoints active</p>
          </div>
          <p className="text-[10px] text-neutral-600">v2.1.0 • Phase 6 Deployed</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-14 glass-panel border-b px-6 flex items-center justify-between sticky top-0 z-40">
          <h2 className="font-semibold text-foreground/80">Command Center</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs text-emerald-300">Pipeline Active</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${active ? 'bg-primary/15 text-primary shadow-[0_0_12px_rgba(16,185,129,0.1)]' : 'text-neutral-400 hover:text-emerald-300 hover:bg-emerald-900/20'}`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  )
}
