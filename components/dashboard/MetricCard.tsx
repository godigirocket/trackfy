"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  variation: string;
  isPositive: boolean;
  prefix?: string;
}

export function MetricCard({ title, value, variation, isPositive, prefix }: MetricCardProps) {
  return (
    <Card className="border-border bg-card enterprise-shadow overflow-hidden transition-all hover:border-primary/30">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="metric-title">{title}</p>
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-black uppercase tracking-tight px-2 py-0.5 rounded-lg",
            isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {variation}
          </div>
        </div>
        
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-xl font-black text-muted-foreground/50 tracking-tighter">{prefix}</span>}
          <h2 className="metric-value text-foreground">{value}</h2>
        </div>

        <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isPositive ? "bg-emerald-500" : "bg-rose-500"
            )} 
            style={{ width: "65%" }} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
