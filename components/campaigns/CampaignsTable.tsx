"use client";

import { useAppStore } from "@/store/useAppStore";
import { 
  formatCurrency, 
  formatNumber, 
  extractMetric,
  LEAD_ACTION_TYPES,
  CONVERSATION_ACTION_TYPES
} from "@/lib/formatters";
import { calculateHealthScore } from "@/services/rulesEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Download, 
  ImageIcon,
  Rocket,
  Octagon
} from "lucide-react";
import { safeArray } from "@/lib/safeArray";

export function CampaignsTable() {
  const { metaData, searchQuery, statusFilter, isDirectorMode, setDrawerCampaignId, creativesHD } = useAppStore();

  const filterItem = (item: any) => {
    const matchesSearch = (item.campaign_name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
                          (item.ad_name || "").toLowerCase().includes((searchQuery || "").toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                          statusFilter === "active";

    return matchesSearch && matchesStatus;
  };

  const campaignMap: Record<string, any> = {};
  safeArray(metaData).forEach((r) => {
    if (!filterItem(r)) return;
    const id = r.campaign_id;
    if (!campaignMap[id]) {
      campaignMap[id] = {
        id,
        name: r.campaign_name,
        status: "ACTIVE",
        spend: 0,
        imps: 0,
        clicks: 0,
        leads: 0,
        convs: 0,
        regs: 0,
        frequency: 0,
      };
    }
    const c = campaignMap[id];
    c.spend += parseFloat(r.spend || "0");
    c.imps += parseInt(r.impressions || "0");
    c.clicks += parseInt(r.clicks || "0");
    c.leads += extractMetric(r.actions, LEAD_ACTION_TYPES);
    c.convs += extractMetric(r.actions, CONVERSATION_ACTION_TYPES);
    c.regs += extractMetric(r.actions, ["complete_registration"]);
    c.frequency = Math.max(c.frequency, parseFloat(r.frequency || "0"));
  });

  const campaigns = Object.values(campaignMap).sort((a: any, b: any) => b.spend - a.spend);

  const totalLeads = campaigns.reduce((sum, c: any) => sum + c.leads, 0);
  const totalSpend = campaigns.reduce((sum, c: any) => sum + c.spend, 0);
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

  return (
    <div className="glass overflow-hidden border-white/5 shadow-2xl rounded-2xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
            {isDirectorMode ? "Resumo de Performance" : "Inteligência de Campanhas"}
          </h3>
        </div>
        <Button variant="outline" size="sm" className="gap-2 font-black h-8 text-[10px] border-border bg-background hover:bg-muted uppercase tracking-widest">
          <Download className="w-3 h-3" />
          Exportar Relatório
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Campanha & Status</th>
              {!isDirectorMode && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Saúde (IA)</th>}
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Investido</th>
              {!isDirectorMode && (
                <>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">CTR</th>
                </>
              )}
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Leads / CPL</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Ação Recomendada</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {campaigns.map((c: any) => {
              const score = calculateHealthScore(c, avgCpl);
              const cpl = c.leads > 0 ? c.spend / c.leads : 0;
              const ctr = c.imps > 0 ? (c.clicks / c.imps) * 100 : 0;

              const isScaling = avgCpl > 0 && cpl > 0 && cpl < avgCpl * 0.7 && c.leads > 5;
              const isStopLoss = avgCpl > 0 && c.spend > avgCpl * 2 && c.leads === 0;

              return (
                <tr 
                  key={c.id} 
                  className="group hover:bg-muted/30 transition-all cursor-pointer"
                  onClick={() => setDrawerCampaignId(c.id)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                        {creativesHD && creativesHD[c.id] ? (
                          <img src={creativesHD[c.id]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                        )}
                        {isScaling && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                             <Rocket className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black truncate group-hover:text-primary transition-colors uppercase tracking-tight">{c.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                           {c.status === "ACTIVE" ? (
                             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Ativa
                             </span>
                           ) : (
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                               <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"/> Pausada
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  </td>
                  {!isDirectorMode && (
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 w-24">
                        <span className="text-[10px] font-black uppercase tracking-widest">{score}/100</span>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              score > 80 ? "bg-emerald-500" : 
                              score > 50 ? "bg-amber-500" : "bg-rose-500"
                            )} 
                            style={{ width: `${score}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-5 text-xs font-black tabular-nums text-right">{formatCurrency(c.spend)}</td>
                  {!isDirectorMode && <td className="px-6 py-4 text-xs font-black tabular-nums text-muted-foreground text-right">{ctr.toFixed(2)}%</td>}
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-primary tabular-nums">{c.leads} Leads</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{formatCurrency(cpl)} / CPL</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                       {isScaling && (
                         <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black uppercase tracking-widest">
                           Escalar
                         </Badge>
                       )}
                       {isStopLoss && (
                         <Badge className="bg-rose-500/10 text-rose-500 border-none text-[9px] font-black uppercase tracking-widest">
                           Pausar
                         </Badge>
                       )}
                       {!isScaling && !isStopLoss && (
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-30 italic">Manter</span>
                       )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {campaigns.length === 0 && (
          <div className="py-20 text-center space-y-3 opacity-30">
            <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-xs font-black uppercase tracking-widest">Nenhuma campanha encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
