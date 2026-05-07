"use client";

import { useAppStore } from "@/store/useAppStore";
import { RefreshCw, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const periods = [
  { label: "HOJE", value: "today" },
  { label: "ONTEM", value: "yesterday" },
  { label: "7D", value: "last_7d" },
  { label: "30D", value: "last_30d" },
  { label: "MÁXIMO", value: "maximum" },
];

export function Topbar() {
  const { period, setPeriod, isLoading } = useAppStore();

  return (
    <header className="h-20 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex gap-1 bg-black/40 rounded-full p-1.5 border border-white/5 shadow-inner">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value as any)}
            className={cn(
              "px-5 py-2 text-[10px] font-black rounded-full transition-all duration-300 uppercase tracking-widest",
              period === p.value
                ? "bg-primary text-white shadow-[0_0_15px_-2px_rgba(168,85,247,0.6)]"
                : "text-muted-foreground/60 hover:text-white"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.location.reload()}
          className={cn(
            "p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group",
            isLoading ? "opacity-50" : ""
          )}
        >
          <RefreshCw className={cn("w-4 h-4 text-muted-foreground group-hover:text-white", isLoading ? "animate-spin" : "")} />
        </button>
        
        <div className="h-8 w-px bg-white/5 mx-2" />
        
        <Link 
            href="/settings"
            className="flex items-center gap-3 pl-4 group transition-all"
        >
            <div className="flex flex-col items-end leading-none">
                <span className="text-xs font-black text-white group-hover:text-primary transition-colors">Juam Silva</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Administrator</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all overflow-hidden">
                <User className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
        </Link>
      </div>
    </header>
  );
}
