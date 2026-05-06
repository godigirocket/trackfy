"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Settings, 
  BarChart2, 
  Link2, 
  Target, 
  Facebook, 
  Search, 
  Wallet,
  Zap,
  Cpu,
  BrainCircuit,
  PieChart
} from "lucide-react";

const menuItems = [
  {
    label: "Core",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
      { label: "Inteligência", icon: BrainCircuit, href: "/intelligence" },
    ]
  },
  {
    label: "Rastreamento",
    items: [
      { label: "Integrações", icon: Link2, href: "/integrations" },
      { label: "UTMs", icon: Target, href: "/utms" },
    ]
  },
  {
    label: "Ads Manager",
    items: [
      { label: "Meta Ads", icon: Facebook, href: "/meta-ads/campaigns" },
      { label: "Google Ads", icon: Search, href: "/google-ads" },
      { label: "Regras", icon: Zap, href: "/rules" },
    ]
  },
  {
    label: "Financeiro",
    items: [
      { label: "Geral", icon: Wallet, href: "/finance" },
    ]
  },
  {
    label: "Configurações",
    items: [
      { label: "Settings", icon: Settings, href: "/settings" },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#050505] border-r border-white/5 w-64 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_-5px_rgba(100,116,139,0.5)]">
          <Zap className="text-white fill-white" size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-white">Trackfy</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Enterprise Tracking</span>
        </div>
      </div>

      <nav className="flex-1 space-y-10">
        {menuItems.map((group) => (
          <div key={group.label} className="space-y-4">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                      isActive 
                        ? "bg-primary/10 text-white shadow-[0_0_15px_-5px_rgba(100,116,139,0.3)]" 
                        : "text-muted-foreground/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon size={18} className={cn(
                      "transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-primary" : "text-muted-foreground/40"
                    )} />
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(100,116,139,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-10 px-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pro Plan Active</p>
          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-primary w-2/3" />
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase">6.4k / 10k Events</p>
        </div>
      </div>
    </div>
  );
}
