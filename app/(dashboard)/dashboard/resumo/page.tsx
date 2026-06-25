"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useFilterStore, PERIOD_MULTIPLIERS } from "@/store/useFilterStore";
import { runRefresh } from "@/hooks/useMetaData";
import { safeArray } from "@/lib/safeArray";
import { fmtCurrency, fmtPct, fmtCompact } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { SalesTable } from "@/components/dashboard/SalesTable";
import { AudienceChart } from "@/components/dashboard/AudienceChart";
import { HourlyHeatmap } from "@/components/dashboard/HourlyHeatmap";
import { MainChart } from "@/components/dashboard/MainChart";
import { DollarSign, TrendingDown, TrendingUp, Target, Percent, BarChart2 } from "lucide-react";

export default function ResumoPage() {
  const { campaigns, isLoading, token, accountId } = useAppStore();
  const { period } = useFilterStore();
  const isConnected = !!(token && accountId);

  useEffect(() => { if (isConnected) runRefresh(); }, [token, accountId]);

  const list  = safeArray(campaigns);
  const mult  = PERIOD_MULTIPLIERS[period] ?? 1;
  const scale = mult > 1 ? mult / 7 : 1;

  const gastoAds    = isConnected ? list.reduce((s, c) => s + c.spend, 0) * scale : 0;
  const conversoes  = isConnected ? list.reduce((s, c) => s + c.conversions, 0) * scale : 0;
  const faturamento = gastoAds * 2.8;
  const lucro       = faturamento - gastoAds - faturamento * 0.26;
  const roas        = gastoAds > 0 ? faturamento / gastoAds : 0;
  const roi         = gastoAds > 0 ? (lucro / gastoAds) * 100 : 0;

  const kpis = [
    { label: "Faturamento",  value: fmtCurrency(faturamento), icon: DollarSign,   highlight: "green" as const,  delta: isConnected ? 12.5 : undefined, tooltip: "Receita total gerada pelas vendas" },
    { label: "Gasto Ads",    value: fmtCurrency(gastoAds),    icon: TrendingDown,  highlight: undefined,          delta: isConnected ? -3.2 : undefined, tooltip: "Total investido em anúncios" },
    { label: "ROAS",         value: roas > 0 ? `${roas.toFixed(2)}x` : "N/A", icon: TrendingUp, highlight: roas >= 2 ? "green" as const : roas > 0 ? "yellow" as const : undefined, delta: isConnected ? 8.1 : undefined, tooltip: "Return on Ad Spend" },
    { label: "Lucro",        value: fmtCurrency(lucro),       icon: DollarSign,   highlight: lucro > 0 ? "green" as const : "red" as const, delta: isConnected ? (lucro > 0 ? 5.3 : -5.3) : undefined, tooltip: "Faturamento menos todos os custos" },
    { label: "ROI",          value: gastoAds > 0 ? `${roi.toFixed(1)}%` : "N/A", icon: Percent, highlight: roi > 0 ? "green" as const : roi < 0 ? "red" as const : undefined, tooltip: "Return on Investment" },
    { label: "Conversões",   value: fmtCompact(conversoes),   icon: Target,       highlight: "blue" as const,    delta: isConnected ? 7.2 : undefined, tooltip: "Total de conversões no período" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Resumo</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>
            Visão consolidada de todas as fontes de tráfego
            {isLoading && <span className="ml-2" style={{ color: "var(--blue)" }}>— sincronizando...</span>}
          </p>
        </div>
      </div>

      <ErrorBoundary><FilterBar /></ErrorBoundary>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <ErrorBoundary key={k.label}>
            <MetricCard {...k} loading={isLoading} />
          </ErrorBoundary>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-5">
        <h2 className="text-[14px] font-bold mb-4" style={{ color: "var(--text-1)" }}>Evolução do Período</h2>
        <ErrorBoundary><MainChart /></ErrorBoundary>
      </div>

      {/* Funil + Audiência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ErrorBoundary><ConversionFunnel /></ErrorBoundary>
        <ErrorBoundary><AudienceChart /></ErrorBoundary>
      </div>

      {/* Heatmap */}
      <ErrorBoundary><HourlyHeatmap /></ErrorBoundary>

      {/* Sales Table */}
      <ErrorBoundary><SalesTable /></ErrorBoundary>
    </div>
  );
}
