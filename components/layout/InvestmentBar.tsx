"use client";

import { useAppStore } from "@/store/useAppStore";
import { Trophy, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

// Níveis de conquista baseados na Utmify
const LEVELS = [
  { name: "Iniciante", threshold: 0, color: "text-slate-400", bg: "bg-slate-400", from: "from-slate-400", to: "to-slate-500" },
  { name: "Bronze", threshold: 10000, color: "text-[#CD7F32]", bg: "bg-[#CD7F32]", from: "from-[#CD7F32]", to: "to-[#A0522D]" },
  { name: "Prata", threshold: 50000, color: "text-zinc-300", bg: "bg-zinc-300", from: "from-zinc-300", to: "to-zinc-500" },
  { name: "Ouro", threshold: 100000, color: "text-[#FFD700]", bg: "bg-[#FFD700]", from: "from-[#FFD700]", to: "to-[#DAA520]" },
  { name: "Platina", threshold: 500000, color: "text-cyan-400", bg: "bg-cyan-400", from: "from-cyan-400", to: "to-blue-500" },
  { name: "Diamante", threshold: 1000000, color: "text-violet-400", bg: "bg-violet-400", from: "from-violet-400", to: "to-fuchsia-500" },
  { name: "Black", threshold: 5000000, color: "text-zinc-800 dark:text-white", bg: "bg-zinc-800 dark:bg-white", from: "from-zinc-800 dark:from-zinc-200", to: "to-black dark:to-zinc-400" },
];

export function InvestmentBar() {
  const { dataA } = useAppStore();

  // Para o exemplo, vamos assumir que o "faturamento" é o totalSpent * ROAS (ex: ROAS de 3.5)
  // E o investimento é a soma do spend.
  // Como é uma visualização de faturamento global (Lifetime), podemos usar um valor base de demonstração
  // se a conta for nova, ou somar tudo.
  const totalSpent = dataA.reduce((acc, curr) => acc + parseFloat(curr.spend || "0"), 0) + 12450; 
  const totalRevenue = totalSpent * 3.62; // Faturamento estimado com base no ROAS

  let currentLevelIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalRevenue >= LEVELS[i].threshold) {
      currentLevelIndex = i;
    } else {
      break;
    }
  }

  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1];

  const progress = nextLevel 
    ? ((totalRevenue - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
    : 100;
  
  const remaining = nextLevel ? nextLevel.threshold - totalRevenue : 0;

  return (
    <div className="w-full bg-[var(--bg-card)] border-b border-[var(--border)] sticky top-14 z-30 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Status Atual */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-inner", currentLevel.from, currentLevel.to)}>
            <Trophy className="w-5 h-5 text-white drop-shadow-md" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conquista Atual</span>
            <span className={cn("text-sm font-black uppercase tracking-tight", currentLevel.color)}>
              {currentLevel.name}
            </span>
          </div>
        </div>

        {/* Centro: Barra de Progresso */}
        <div className="flex-1 w-full max-w-2xl flex flex-col gap-1.5">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              Faturado: <span className="text-primary">{formatCurrency(totalRevenue)}</span>
            </span>
            {nextLevel && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Meta: {formatCurrency(nextLevel.threshold)}
              </span>
            )}
          </div>
          
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden relative shadow-inner">
            <div 
              className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r transition-all duration-1000", currentLevel.from, currentLevel.to)}
              style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>
          
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Investido: {formatCurrency(totalSpent)}
            </span>
            {nextLevel ? (
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Falta {formatCurrency(remaining)}
              </span>
            ) : (
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Nível Máximo Alcançado!</span>
            )}
          </div>
        </div>

        {/* Lado Direito: Próximo Nível */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 opacity-50">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Próximo Nível</span>
            <span className={cn("text-sm font-black uppercase tracking-tight", nextLevel?.color || currentLevel.color)}>
              {nextLevel?.name || "Máximo"}
            </span>
          </div>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br grayscale", nextLevel?.from || currentLevel.from, nextLevel?.to || currentLevel.to)}>
            <Star className="w-4 h-4 text-white" />
          </div>
        </div>

      </div>
    </div>
  );
}
