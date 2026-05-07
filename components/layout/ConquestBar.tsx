"use client";

import { useAppStore } from "@/store/useAppStore";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export function ConquestBar() {
  const { dataA } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalSpend = dataA.reduce((sum, d) => sum + (parseFloat(d.spend || "0")), 0);
  const mockRevenue = 45069; // mock, depois pode vir de integração
  const level = mockRevenue > 50000 ? "OURO" : mockRevenue > 20000 ? "PRATA" : "BRONZE";

  if (!mounted) return <div className="mx-6 mt-4 h-20 bg-card/50 animate-pulse rounded-2xl" />;

  return (
    <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 border border-purple-500/30 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-purple-300 font-mono">CONQUISTA ATUAL</div>
          <div className="text-xl font-bold">{level}</div>
        </div>
      </div>
      <div className="flex gap-6">
        <div>
          <div className="text-xs text-muted-foreground">FATURADO</div>
          <div className="text-lg font-semibold text-green-400">
            R$ {mockRevenue.toLocaleString("pt-BR")}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">INVESTIDO</div>
          <div className="text-lg font-semibold text-red-400">
            R$ {totalSpend.toLocaleString("pt-BR")}
          </div>
        </div>
      </div>
    </div>
  );
}
