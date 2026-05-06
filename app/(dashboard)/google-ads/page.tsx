"use client";

import { GoogleCampaignsTable } from "@/components/google/GoogleCampaignsTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Download, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GoogleAdsPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Google Ads Manager 🔍</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Gestão de rede de pesquisa e Youtube Ads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-black uppercase tracking-widest text-[10px] gap-2">
            <Download size={14} />
            Exportar CSV
          </Button>
          <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] gap-2">
            <Plus size={14} />
            Criar Campanha
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Custo" value="4.120,50" prefix="R$" variation="5%" isPositive={false} />
        <MetricCard title="Conversões" value="158" variation="12%" isPositive={true} />
        <MetricCard title="CPA Médio" value="26,07" prefix="R$" variation="3%" isPositive={true} />
        <MetricCard title="ROAS" value="4.2" variation="18%" isPositive={true} />
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="BUSCAR CAMPANHA..." className="pl-10 h-11 obsidian-card uppercase font-bold text-xs tracking-widest" />
        </div>
        <Button variant="outline" className="h-11 font-black uppercase tracking-widest text-[10px] gap-2">
          <Filter size={14} />
          Filtros
        </Button>
      </div>

      <GoogleCampaignsTable />
    </div>
  );
}
