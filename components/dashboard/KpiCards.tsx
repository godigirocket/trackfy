"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Zap, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: any;
  color: string;
}

function KpiCard({ title, value, change, trend, icon: Icon, color }: KpiCardProps) {
  return (
    <Card className="border-border bg-card/50 hover:bg-card transition-all group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-xl transition-all group-hover:scale-110", color)}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black tracking-tighter">{value}</div>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : trend === "down" ? (
              <TrendingDown className="w-3 h-3 text-rose-500" />
            ) : null}
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground"
            )}>
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiCards() {
  // These would come from the store in a real scenario
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiCard 
        title="Investimento Total" 
        value="R$ 12.450,00" 
        change="+12.5% vs. anterior" 
        trend="up"
        icon={DollarSign}
        color="bg-primary/10 text-primary"
      />
      <KpiCard 
        title="Receita Bruta" 
        value="R$ 45.890,00" 
        change="+8.2% vs. anterior" 
        trend="up"
        icon={ShoppingCart}
        color="bg-emerald-500/10 text-emerald-500"
      />
      <KpiCard 
        title="Lucro Real" 
        value="R$ 33.440,00" 
        change="+5.1% vs. anterior" 
        trend="up"
        icon={Zap}
        color="bg-amber-500/10 text-amber-500"
      />
      <KpiCard 
        title="Volume de Vendas" 
        value="842" 
        change="-2.4% vs. anterior" 
        trend="down"
        icon={BarChart3}
        color="bg-blue-500/10 text-blue-500"
      />
      <KpiCard 
        title="ROAS Geral" 
        value="3.68x" 
        change="+0.4x vs. anterior" 
        trend="up"
        icon={Target}
        color="bg-purple-500/10 text-purple-500"
      />
      <KpiCard 
        title="CTR Período" 
        value="1.42%" 
        change="0.1% vs. anterior" 
        trend="neutral"
        icon={BarChart3}
        color="bg-rose-500/10 text-rose-500"
      />
    </div>
  );
}
