import React from "react"
import { Activity, Sliders, LayoutDashboard, Leaf, Link as LinkIcon, FileText, Globe } from "lucide-react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020b09] flex flex-col md:flex-row text-sm relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-teal-900/10 rounded-full blur-[100px]"></div>
      </div>
      
      <aside className="w-full md:w-72 glass-panel border-r border-white/5 p-6 flex flex-col gap-10 md:h-screen sticky top-0 z-50 rounded-none">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter premium-gradient-text leading-none">NeuralCarbon</h1>
            <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.4em] mt-1">Intelligence</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-1.5">
          <NavItem icon={<LayoutDashboard size={16} />} label="Control Center" href="#" active />
          <NavItem icon={<Activity size={16} />} label="Neural Drift" href="#neural-drift" />
          <NavItem icon={<Sliders size={16} />} label="Prescriptions" href="#prescriptions" />
          <NavItem icon={<LinkIcon size={16} />} label="ESG Ledger" href="#esg-ledger" />
          <NavItem icon={<FileText size={16} />} label="Compliance" href="#compliance" />
        </nav>
        
        <div className="mt-auto hidden md:flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              <span className="text-[8px] text-primary font-black uppercase tracking-widest">Active Link</span>
            </div>
            <p className="text-[9px] text-neutral-500 font-medium">Telemetry Streams: Synchronized</p>
          </div>
          <div className="flex justify-between items-center px-2">
            <p className="text-[8px] text-neutral-700 font-bold uppercase tracking-widest">v2.4.0_Stable</p>
            <div className="flex gap-1 opacity-20">
              <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
              <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <header className="h-16 glass-panel border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40 rounded-none bg-[#020b09]/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
             <div className="w-0.5 h-3 bg-primary/40 rounded-full"></div>
             <h2 className="font-black text-[9px] uppercase tracking-[0.4em] text-neutral-500">Global Nexus Console</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <Globe className="w-3 h-3 text-neutral-600" />
              <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Cluster: US-EAST</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, href = "#", active = false }: { icon: React.ReactNode, label: string, href?: string, active?: boolean }) {
  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith("#") && href !== "#") {
      e.preventDefault();
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <a 
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-left cursor-pointer group ${active ? 'bg-primary/10 text-primary border border-primary/10' : 'text-neutral-400 hover:text-primary hover:bg-primary/5'}`}
    >
      <span className={`${active ? 'text-primary' : 'text-neutral-600 group-hover:text-primary'} transition-colors`}>
        {icon}
      </span>
      <span className="font-bold text-[11px] uppercase tracking-wider">{label}</span>
    </a>
  )
}
