"use client";

export const dynamic = "force-dynamic";


import { FunnelViz } from "@/components/intelligence/FunnelViz";
import { DeliveryHealth } from "@/components/intelligence/DeliveryHealth";
import { HourlyHeatmap } from "@/components/intelligence/HourlyHeatmap";
import { DateRangePicker } from "@/components/intelligence/DateRangePicker";
import { ControlBar } from "@/components/intelligence/ControlBar";
import { SummaryCards } from "@/components/intelligence/SummaryCards";
import { CampaignTimeline } from "@/components/intelligence/CampaignTimeline";
import { AudienceBreakdown } from "@/components/intelligence/AudienceBreakdown";
import { OptimizationPanel } from "@/components/intelligence/OptimizationPanel";

export default function IntelligencePage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Intelligence Center 🧠</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Análise profunda de dados e detecção de anomalias por IA.
          </p>
        </div>
        <DateRangePicker />
      </div>

      <ControlBar />
      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <FunnelViz intel={[]} />
        </div>
        <div className="lg:col-span-4">
          <DeliveryHealth />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-12">
          <HourlyHeatmap />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <CampaignTimeline />
        </div>
        <div className="lg:col-span-5">
          <AudienceBreakdown />
        </div>
      </div>

      <OptimizationPanel />
    </div>
  );
}
