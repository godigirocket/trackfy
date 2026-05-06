"use client";
import { useAppStore } from "@/store/useAppStore";
import { X, Users, Map, Zap, Layers, ImageIcon, ChevronRight, Copy, Loader2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractMetric, formatCurrency, formatNumber, LEAD_ACTION_TYPES, CONVERSATION_ACTION_TYPES } from "@/lib/formatters";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { duplicateCampaign } from "@/services/metaApi";
import { useToast } from "@/components/ui/toast";
import { runRefresh, clearFetchCache } from "@/hooks/useMetaData";

import { MetricInsight } from "@/components/intelligence/MetricInsight";

type Tab = "overview" | "adsets" | "ads";

export function CampaignDrawer() {
  const {
    drawerCampaignId, setDrawerCampaignId,
    metaData, metaAdsData, hierarchy,
    ageBreakdownA, regionBreakdownA,
    creativesHD,
  } = useAppStore();

  const [tab, setTab] = useState<Tab>("overview");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const { toast } = useToast();
  const { metaToken, accountId } = useAppStore();

  const data = useMemo(() => {
    if (!drawerCampaignId) return null;

    const rows = metaData.filter(d => d.campaign_id === drawerCampaignId);
    const ads = metaAdsData.filter(d => d.campaign_id === drawerCampaignId);
    const name = rows[0]?.campaign_name || ads[0]?.campaign_name || "Campanha";

    // Aggregate totals
    const totals = rows.reduce((acc, r) => {
      acc.spend += parseFloat(r.spend || "0");
      acc.impressions += parseInt(r.impressions || "0");
      acc.clicks += parseInt(r.clicks || "0");
      acc.leads += extractMetric(r.actions, LEAD_ACTION_TYPES);
      acc.conversations += extractMetric(r.actions, CONVERSATION_ACTION_TYPES);
      return acc;
    }, { spend: 0, impressions: 0, clicks: 0, leads: 0, conversations: 0 });

    // Adsets from hierarchy
    const adsets = (hierarchy?.adsets || []).filter((as: any) => as.campaign_id === drawerCampaignId);

    // Adset-level metrics from dataAds
    const adsetMetrics: Record<string, { spend: number; leads: number; conversations: number; impressions: number }> = {};
    ads.forEach((ad: any) => {
      const asId = ad.adset_id || "";
      if (!adsetMetrics[asId]) adsetMetrics[asId] = { spend: 0, leads: 0, conversations: 0, impressions: 0 };
      adsetMetrics[asId].spend += parseFloat(ad.spend || "0");
      adsetMetrics[asId].leads += extractMetric(ad.actions, LEAD_ACTION_TYPES);
      adsetMetrics[asId].conversations += extractMetric(ad.actions, CONVERSATION_ACTION_TYPES);
      adsetMetrics[asId].impressions += parseInt(ad.impressions || "0");
    });

    // Aggregate ads by ad_id
    const adMap: Record<string, any> = {};
    ads.forEach((ad: any) => {
      const id = ad.ad_id || "";
      if (!adMap[id]) adMap[id] = { ...ad, _leads: 0, _convs: 0, _spend: 0 };
      adMap[id]._spend += parseFloat(ad.spend || "0");
      adMap[id]._leads += extractMetric(ad.actions, LEAD_ACTION_TYPES);
      adMap[id]._convs += extractMetric(ad.actions, CONVERSATION_ACTION_TYPES);
    });
    const adList = Object.values(adMap).sort((a: any, b: any) => b._spend - a._spend);

    const regions = regionBreakdownA
      .filter((d: any) => d.campaign_id === drawerCampaignId)
      .reduce((acc: any[], r: any) => {
        const existing = acc.find(x => x.region === r.region);
        if (existing) {
          existing.spend += parseFloat(r.spend || "0");
          existing.leads += extractMetric(r.actions, LEAD_ACTION_TYPES);
        } else {
          acc.push({ region: r.region, spend: parseFloat(r.spend || "0"), leads: extractMetric(r.actions, LEAD_ACTION_TYPES) });
        }
        return acc;
      }, [])
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 6);

    return { name, totals, adsets, adsetMetrics, adList, regions };
  }, [drawerCampaignId, metaData, metaAdsData, hierarchy, regionBreakdownA]);

  if (!drawerCampaignId || !data) return null;

  const cpl = data.totals.leads > 0 ? data.totals.spend / data.totals.leads : 0;
  const ctr = data.totals.impressions > 0 ? (data.totals.clicks / data.totals.impressions) * 100 : 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setDrawerCampaignId(null)} />

      <aside className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface border-l border-white/5 shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-start justify-between">
          <div>
            <span className="text-[9px] font-bold text-accent uppercase tracking-[0.2em]">Relatório Isolado</span>
            <h2 className="text-base font-bold text-white mt-0.5 max-w-md leading-tight">{data.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={async () => {
                if (!drawerCampaignId || !metaToken) return;
                setIsDuplicating(true);
                try {
                  const res = await duplicateCampaign(drawerCampaignId, metaToken);
                  if (res.success) {
                    toast("Campanha duplicada com sucesso!", "success");
                    clearFetchCache();
                    runRefresh();
                  } else {
                    toast(res.error || "Erro ao duplicar", "error");
                  }
                } catch (e: any) {
                  toast(e.message || "Erro inesperado", "error");
                } finally {
                  setIsDuplicating(false);
                }
              }}
              disabled={isDuplicating}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white text-[11px] font-bold hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
            >
              {isDuplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />} Duplicar
            </button>
            <a 
              href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${accountId}&selected_campaign_ids=${drawerCampaignId}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1877f2] text-white text-[11px] font-bold hover:bg-[#166fe5] transition-all shadow-lg shadow-blue-500/20"
            >
              <Zap className="w-3.5 h-3.5" /> Abrir no Meta
            </a>
            <button onClick={() => setDrawerCampaignId(null)} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-5 divide-x divide-white/5 border-b border-white/5">
          {[
            { label: "Gasto", value: formatCurrency(data.totals.spend), color: "text-white", type: 'spend', num: data.totals.spend },
            { label: "Impressões", value: formatNumber(data.totals.impressions), color: "text-white", type: 'other', num: data.totals.impressions },
            { label: "CTR", value: ctr.toFixed(2) + "%", color: "text-white", type: 'ctr', num: ctr },
            { label: "Leads", value: formatNumber(data.totals.leads), color: "text-accent", type: 'leads', num: data.totals.leads },
            { label: "CPL", value: formatCurrency(cpl), color: cpl > 0 ? "text-emerald-400" : "text-white", type: 'cpl', num: cpl },
          ].map((k: any) => (
            <div key={k.label} className="p-4 flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest block">{k.label}</span>
              <span className={cn("text-sm font-black mono", k.color)}>{k.value}</span>
              {k.type !== 'other' && <MetricInsight type={k.type as any} value={k.num} />}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(["overview", "adsets", "ads"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                tab === t ? "text-accent border-b-2 border-accent" : "text-muted hover:text-white"
              )}
            >
              {t === "overview" ? "Visão Geral" : t === "adsets" ? `Conjuntos (${data.adsets.length})` : `Anúncios (${data.adList.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {tab === "overview" && (
            <>
              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="glass p-4">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">ROI Estimado</span>
                    <span className="text-xl font-black mono text-emerald-400">{(data.totals.conversations * 25 / (data.totals.spend || 1)).toFixed(2)}x</span>
                 </div>
                 <div className="glass p-4">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">CPC Médio</span>
                    <span className="text-xl font-black mono text-white">{formatCurrency(data.totals.clicks > 0 ? data.totals.spend / data.totals.clicks : 0)}</span>
                 </div>
              </div>

              {/* Conversations */}
              <div className="glass p-5 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                  <Brain className="w-16 h-16 text-accent" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Análise da Trackfy IA</span>
                  <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                    <p className="text-[12px] text-white/60 leading-relaxed font-medium">
                      Esta campanha apresenta um <span className="text-emerald-400 font-bold">CPL de {formatCurrency(cpl)}</span>, o que está dentro da meta esperada. 
                      O CTR de <span className="text-white font-bold">{ctr.toFixed(2)}%</span> sugere que o criativo está ressonando bem com o público. 
                      Sugerimos manter o orçamento atual e monitorar a frequência.
                    </p>
                  </div>
                </div>
              </div>

              {/* Regions */}
              {data.regions.length > 0 && (
                <div className="glass p-5 space-y-4">
                  <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Map className="w-4 h-4 text-accent" /> Top Regiões por Performance
                  </h3>
                  <div className="space-y-2">
                    {data.regions.map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-lg transition-all">
                        <span className="text-xs font-bold text-white">{r.region || "Desconhecido"}</span>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-[11px] text-emerald-400 font-black">{r.leads} leads</p>
                             <p className="text-[9px] text-muted font-bold uppercase">{formatCurrency(r.leads > 0 ? r.spend / r.leads : 0)} / lead</p>
                          </div>
                          <span className="text-xs mono text-muted w-20 text-right">{formatCurrency(r.spend)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "adsets" && (
            <div className="space-y-3">
              {data.adsets.length === 0 ? (
                <div className="py-12 text-center text-muted text-xs">Nenhum conjunto encontrado para esta campanha.</div>
              ) : data.adsets.map((as: any) => {
                const m = data.adsetMetrics[as.id] || { spend: 0, leads: 0, conversations: 0, impressions: 0 };
                const isActive = as.effective_status === "ACTIVE";
                return (
                  <div key={as.id} className="glass p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", isActive ? "bg-success animate-pulse" : "bg-muted")} />
                        <span className="text-xs font-bold text-white truncate">{as.name}</span>
                      </div>
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                        isActive ? "bg-success/10 text-success" : "bg-white/5 text-muted"
                      )}>
                        {as.effective_status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Gasto", value: formatCurrency(m.spend) },
                        { label: "Imps", value: formatNumber(m.impressions) },
                        { label: "Leads", value: String(m.leads) },
                        { label: "Conversas", value: String(m.conversations) },
                      ].map(k => (
                        <div key={k.label} className="text-center p-2 rounded-lg bg-white/[0.03]">
                          <span className="text-[9px] text-muted font-bold uppercase block">{k.label}</span>
                          <span className="text-xs font-black mono text-white">{k.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "ads" && (
            <div className="space-y-3">
              {data.adList.length === 0 ? (
                <div className="py-12 text-center text-muted text-xs">Nenhum anúncio encontrado para esta campanha.</div>
              ) : data.adList.map((ad: any) => {
                const thumb = creativesHD?.[ad.ad_id];
                const adCpl = ad._leads > 0 ? ad._spend / ad._leads : 0;
                return (
                  <div key={ad.ad_id} className="glass overflow-hidden">
                    {thumb && (
                      <div className="aspect-video w-full overflow-hidden bg-white/5">
                        <img src={thumb} alt={ad.ad_name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-white leading-tight">{ad.ad_name}</span>
                        {!thumb && <ImageIcon className="w-4 h-4 text-muted/30 flex-shrink-0" />}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: "Gasto", value: formatCurrency(ad._spend) },
                          { label: "Leads", value: String(ad._leads) },
                          { label: "Conversas", value: String(ad._convs) },
                          { label: "CPL", value: formatCurrency(adCpl) },
                        ].map(k => (
                          <div key={k.label} className="text-center p-2 rounded-lg bg-white/[0.03]">
                            <span className="text-[9px] text-muted font-bold uppercase block">{k.label}</span>
                            <span className="text-xs font-black mono text-white">{k.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <Button className="w-full h-10 font-bold text-[11px] uppercase tracking-widest" onClick={() => setDrawerCampaignId(null)}>
            Fechar
          </Button>
        </div>
      </aside>
    </>
  );
}
