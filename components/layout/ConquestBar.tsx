"use client";

import { useAppStore } from "@/store/useAppStore";
import { Trophy, ArrowUpRight, ArrowDownRight, Wallet, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ConquestBar() {
  const { dataA } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const totalSpend = dataA.reduce((sum, d) => sum + (parseFloat(d.spend || "0")), 0);
  const mockRevenue = 45069;
  const level = mockRevenue > 50000 ? "OURO" : mockRevenue > 20000 ? "PRATA" : "BRONZE";

  if (!mounted) return <div className="mx-8 mt-6 h-24 bg-card/50 animate-pulse rounded-2xl border border-border" />;

  return (
    <div className="mx-8 mt-6 p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/20 to-purple-900/40 border border-purple-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-8 enterprise-shadow">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)]">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-[10px] text-purple-300 font-black uppercase tracking-[0.2em] mb-1">CONQUISTA ATUAL</div>
          <div className="text-3xl font-black tracking-tighter text-white">{level}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <Target className="w-3 h-3 text-green-400" />
            FATURADO
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">R$ {mockRevenue.toLocaleString("pt-BR")}</span>
            <div className="flex items-center gap-0.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                <ArrowUpRight className="w-3 h-3 text-green-400" />
                <span className="text-[10px] font-black text-green-400">12%</span>
            </div>
          </div>
        </div>
        
        <div className="w-px h-10 bg-white/5" />
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <Wallet className="w-3 h-3 text-red-400" />
            INVESTIDO
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">R$ {totalSpend.toLocaleString("pt-BR")}</span>
            <div className="flex items-center gap-0.5 px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20">
                <ArrowDownRight className="w-3 h-3 text-red-400" />
                <span className="text-[10px] font-black text-red-400">8%</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">PRÓXIMO NÍVEL</div>
            <div className="h-1.5 w-32 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[65%]" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">PRATA • 65%</span>
        </div>
      </div>
    </div>
  );
}
