"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { runRefresh } from "@/hooks/useMetaData";
import { updateCampaign } from "@/services/metaApi";
import { ChevronDown, ChevronRight, Edit2, Power, Search, Filter } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  PAUSED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DELETED: "bg-red-500/20 text-red-400 border-red-500/30",
  ARCHIVED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function DashboardPage() {
  const { metaToken, accountId, hierarchy, dataA, isLoading } = useAppStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBudget, setEditBudget] = useState("");

  useEffect(() => {
    if (metaToken && accountId) runRefresh();
  }, [metaToken, accountId]);

  const campaigns = hierarchy?.campaigns || [];
  const filtered = campaigns.filter((c: any) => {
    if (statusFilter !== "ALL" && c.effective_status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const metricsMap: Record<string, any> = {};
  dataA.forEach((row: any) => {
    if (row.campaign_id) metricsMap[row.campaign_id] = row;
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const handleStatusToggle = async (id: string, current: string) => {
    const newStatus = current === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await updateCampaign(id, metaToken!, { status: newStatus });
    runRefresh();
  };

  const handleEdit = (campaign: any) => {
    setEditingId(campaign.id);
    setEditName(campaign.name);
    const budget = campaign.daily_budget || campaign.lifetime_budget;
    setEditBudget(budget ? (budget / 100).toString() : "");
  };

  const handleSave = async (id: string) => {
    const updates: any = { name: editName };
    if (editBudget && !isNaN(Number(editBudget))) {
      updates.daily_budget = Math.round(Number(editBudget) * 100);
    }
    await updateCampaign(id, metaToken!, updates);
    setEditingId(null);
    runRefresh();
  };

  if (!metaToken || !accountId) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 font-bold uppercase tracking-widest text-xs">Configure seu Token e ID de Conta nas Configurações</p>
          <a href="/settings" className="px-6 py-3 bg-primary text-white font-black rounded-xl uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]">Ir para Configurações</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Meta Ads Manager</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Buscar por nome ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-xl text-xs w-64 focus:border-primary/50 transition-all outline-none"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"><Filter className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-card/30 backdrop-blur-sm">
        <table className="w-full text-xs">
          <thead className="bg-white/5 border-b border-white/5">
            <tr className="text-left text-muted-foreground uppercase tracking-widest font-black">
              <th className="p-4 w-8"></th>
              <th className="p-4">Campanha</th>
              <th className="p-4">Status</th>
              <th className="p-4">Resultados</th>
              <th className="p-4">Custo/Res.</th>
              <th className="p-4">Orçamento</th>
              <th className="p-4">Gasto total</th>
              <th className="p-4">ROI</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((campaign: any) => {
              const metrics = metricsMap[campaign.id] || {};
              const spend = parseFloat(metrics.spend || "0");
              const convs = metrics.leads || metrics.conversations || 0;
              const cpl = convs ? spend / convs : 0;
              const budget = campaign.daily_budget || campaign.lifetime_budget;
              const isExpanded = expanded.has(campaign.id);
              const adsets = (hierarchy?.adsets || []).filter((a: any) => a.campaign_id === campaign.id);

              return (
                <key key={campaign.id}>
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      {adsets.length > 0 && (
                        <button onClick={() => toggleExpand(campaign.id)}>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      )}
                    </td>
                    <td className="p-4 font-black text-white uppercase tracking-tight">
                      {editingId === campaign.id ? (
                        <div className="flex gap-2 items-center">
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-black/50 px-2 py-1.5 rounded border border-white/10 text-xs w-48" />
                          <input value={editBudget} onChange={e => setEditBudget(e.target.value)} placeholder="Orçamento" className="bg-black/50 px-2 py-1.5 rounded border border-white/10 text-xs w-24" />
                          <button onClick={() => handleSave(campaign.id)} className="text-green-400 font-bold">OK</button>
                          <button onClick={() => setEditingId(null)} className="text-red-400 font-bold">X</button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                           <span>{campaign.name}</span>
                           <span className="text-[10px] text-muted-foreground font-normal tracking-normal">ID: {campaign.id}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_STYLES[campaign.effective_status] || STATUS_STYLES.PAUSED}`}>
                        {campaign.effective_status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{convs} Conversas</td>
                    <td className="p-4 font-bold text-white">R$ {cpl.toFixed(2)}</td>
                    <td className="p-4 font-bold text-white">R$ {budget ? (budget / 100).toFixed(2) : "—"}</td>
                    <td className="p-4 font-bold text-white">R$ {spend.toFixed(2)}</td>
                    <td className="p-4 font-bold text-green-400">—</td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                            onClick={() => handleStatusToggle(campaign.id, campaign.effective_status)}
                            className="p-2 rounded-lg hover:bg-white/5"
                        >
                          <Power className={`w-4 h-4 ${campaign.effective_status === "ACTIVE" ? "text-green-400" : "text-yellow-400"}`} />
                        </button>
                        <button 
                            onClick={() => handleEdit(campaign)}
                            className="p-2 rounded-lg hover:bg-white/5"
                        >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && adsets.length > 0 && (
                    <tr className="bg-white/[0.01]">
                      <td colSpan={9} className="p-4 pl-12">
                        <div className="space-y-4">
                          {adsets.map((adset: any) => (
                            <div key={adset.id} className="border-l-2 border-primary/20 pl-4 py-1">
                              <div className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{adset.name}</div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                                {(hierarchy?.ads || []).filter((ad: any) => ad.adset_id === adset.id).map((ad: any) => (
                                  <div key={ad.id} className="flex items-center gap-3 text-[10px] bg-black/40 p-2 rounded-xl border border-white/5 group/ad">
                                    {ad.creative?.thumbnail_url && (
                                        <img src={ad.creative.thumbnail_url} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                                    )}
                                    <div className="flex flex-col min-w-0">
                                        <span className="truncate font-bold text-white">{ad.name}</span>
                                        <span className="text-[9px] text-muted-foreground uppercase">{ad.status}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </key>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
