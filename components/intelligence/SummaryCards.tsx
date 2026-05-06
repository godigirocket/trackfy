"use client";

import { useAppStore } from "@/store/useAppStore";
import { formatCurrency } from "@/lib/formatters";
import { 
  DollarSign, Users, Target, 
  MessageCircle, TrendingUp, AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryProps {
  summary: {
    totalSpend: number;
    totalLeads: number;
    avgCpl: number;
    totalConversations: number;
    scalable: number;
    needsAttention: number;
  }
}

export function SummaryCards({ summary }: SummaryProps) {
  const cards = [
    { label: "INVESTIMENTO TOTAL", value: formatCurrency(summary.totalSpend), icon: DollarSign },
    { label: "CPL MÉDIO GERAL", value: formatCurrency(summary.avgCpl), icon: Target },
    { label: "CONVERSAS/LEADS", value: (summary.totalLeads > 0 ? summary.totalLeads : summary.totalConversations).toLocaleString("pt-BR"), icon: Users },
    { label: "CONVERSAS INICIADAS", value: summary.totalConversations.toLocaleString("pt-BR"), icon: MessageCircle },
    { label: "CAMPANHAS ESCALAR 🟢", value: summary.scalable.toString(), icon: TrendingUp },
    { label: "ATENÇÃO / CORTE 🔴", value: summary.needsAttention.toString(), icon: AlertCircle },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {cards.map((card) => (
        <div 
          key={card.label} 
          className="bg-card border border-white/5 rounded-xl p-5 flex flex-col gap-4 group transition-all hover:border-white/10"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent/10">
            <card.icon className="w-4 h-4 text-accent" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {card.value}
            </span>
            <span className="text-[12px] font-medium text-muted uppercase tracking-wide">
              {card.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
