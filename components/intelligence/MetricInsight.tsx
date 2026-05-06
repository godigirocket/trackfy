"use client";

import { useAppStore } from "@/store/useAppStore";
import { Sparkles, TrendingUp, TrendingDown, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface MetricInsightProps {
  type: 'spend' | 'leads' | 'cpl' | 'ctr' | 'roas' | 'convs';
  value: number;
  className?: string;
  horizontal?: boolean;
}

export function MetricInsight({ type, value, className, horizontal }: MetricInsightProps) {
  const { geminiKey } = useAppStore();

  const insight = useMemo(() => {
    switch (type) {
      case 'spend':
        if (value > 5000) return { label: "Investimento Robusto", color: "text-indigo-400", reason: "Volume alto permite aprendizado rápido da IA." };
        if (value > 1000) return { label: "Escala Moderada", color: "text-blue-400", reason: "Investimento saudável para otimização de público." };
        return { label: "Fase de Teste", color: "text-muted", reason: "Orçamento inicial. Foque em validação de criativos." };
      
      case 'cpl':
        if (value < 5) return { label: "CPL Excelente", color: "text-emerald-400", reason: "Abaixo da média do mercado. Oportunidade de escala agressiva." };
        if (value < 15) return { label: "CPL Dentro da Meta", color: "text-blue-400", reason: "Custo equilibrado. Mantenha monitoramento de qualidade." };
        return { label: "CPL Elevado", color: "text-rose-400", reason: "Acima do ideal. Revise criativos ou segmentação imediatamente." };
      
      case 'ctr':
        if (value > 2) return { label: "CTR Viral", color: "text-emerald-400", reason: "Criativo com altíssima retenção e apelo visual." };
        if (value > 1) return { label: "CTR Saudável", color: "text-blue-400", reason: "Acima da média de 1%. Criativo está performando bem." };
        return { label: "CTR Baixo", color: "text-amber-400", reason: "Fadiga de criativo detectada ou público desqualificado." };

      case 'roas':
        if (value > 4) return { label: "Escala Vertical", color: "text-emerald-400", reason: "Retorno altíssimo. Dobre o investimento nos melhores conjuntos." };
        if (value > 2) return { label: "Lucrativo", color: "text-blue-400", reason: "Operação saudável com margem de lucro positiva." };
        return { label: "Atenção ROI", color: "text-rose-400", reason: "Retorno abaixo do break-even projetado. Revise o funil." };
      
      case 'leads':
        if (value > 100) return { label: "Volume Crítico", color: "text-emerald-400", reason: "Volume suficiente para otimização por conversão (CAPI)." };
        return { label: "Volume de Teste", color: "text-muted", reason: "Aguardando mais dados para conclusões estatísticas." };

      default:
        return { label: "Métrica Ativa", color: "text-muted", reason: "Monitoramento em tempo real ativado." };
    }
  }, [type, value]);

  return (
    <div className={cn(
      "flex flex-col gap-1 group/insight relative",
      horizontal && "flex-row items-center gap-3",
      className
    )}>
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/[0.02]",
        insight.color
      )}>
        <Zap className="w-2.5 h-2.5" />
        {insight.label}
      </div>

      <div className="absolute bottom-full left-0 mb-2 w-48 p-3 glass border-white/10 opacity-0 group-hover/insight:opacity-100 translate-y-2 group-hover/insight:translate-y-0 transition-all pointer-events-none z-[100] shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
           <Sparkles className="w-3.5 h-3.5 text-accent" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Análise de IA</span>
        </div>
        <p className="text-[11px] text-white/60 font-medium leading-relaxed">
          {insight.reason}
        </p>
        {!geminiKey && (
          <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-amber-400/60 italic font-bold">
            Ative a Gemini Key para insights preditivos avançados.
          </div>
        )}
      </div>
    </div>
  );
}
