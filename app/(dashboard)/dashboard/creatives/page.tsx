"use client";
import { useState } from "react";
import { Search, Grid, List, Eye, MousePointerClick, HelpCircle, Play, Image as ImageIcon, BarChart2, Copy, Pause, TrendingUp, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { safeArray } from "@/lib/safeArray";
import { fmtCurrency, fmtPct, fmtCompact, cn } from "@/lib/utils";
import { ConnectGuide } from "@/components/shared/ConnectGuide";
import { Facebook } from "lucide-react";

const META_STEPS = [
  { title: "Conecte sua conta Meta Ads", description: "Vá em Configurações → Meta Ads e cole seu Access Token e Account ID.", link: { label: "Ir para Configurações", url: "/dashboard/settings" } },
  { title: "Sincronize os dados", description: "Clique em 'Salvar e Sincronizar' para carregar seus criativos reais." },
];

const FORMAT_COLORS: Record<string, string> = {
  Vídeo:    "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Imagem:   "bg-slate-500/10 text-slate-500 border-slate-500/20",
  Carrossel:"bg-purple-500/10 text-purple-500 border-purple-500/20",
  Reels:    "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

function HookRateBar({ value }: { value: number }) {
  const color = value >= 60 ? "var(--green)" : value >= 40 ? "var(--yellow)" : "var(--red)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold w-8 text-right tabular-nums" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function CreativesPage() {
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [search, setSearch]       = useState("");
  const [formatFilter, setFormat] = useState("ALL");
  const [statusFilter, setStatus] = useState("ALL");
  const [selected, setSelected]   = useState<string | null>(null);
  const { ads, token, accountId } = useAppStore();
  const isConnected = !!(token && accountId);

  // Apenas dados reais da API — sem mock
  const source = safeArray(ads).map((a) => ({
    id: a.id,
    name: a.name,
    format: a.format ?? "Imagem",
    campaign: "",
    adset: "",
    impressions: a.impressions,
    clicks: a.clicks,
    ctr: a.ctr,
    cpl: a.cpl,
    spend: a.spend,
    status: a.status,
    hookRate: a.impressions > 0 ? Math.min(95, Math.round((a.clicks / a.impressions) * 100 * 20)) : 0,
    thumb: a.thumbnailUrl ?? "",
  }));

  const formats = ["ALL", ...Array.from(new Set(source.map((c) => c.format)))];

  const filtered = source.filter((c) => {
    const ms  = c.name.toLowerCase().includes(search.toLowerCase());
    const mf  = formatFilter === "ALL" || c.format === formatFilter;
    const mst = statusFilter === "ALL" || c.status === statusFilter;
    return ms && mf && mst;
  });

  const selectedCreative = selected ? source.find((c) => c.id === selected) : null;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Hub de Criativos — Meta Ads</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>Analise performance e previews dos seus criativos reais</p>
      </div>

      {!isConnected && (
        <ConnectGuide platform="Meta Ads" icon={<Facebook className="w-5 h-5 text-white" strokeWidth={2} />} color="bg-blue-600" steps={META_STEPS} />
      )}

      {isConnected && source.length === 0 ? (
        /* Empty state when connected but no ads loaded */
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg-muted)" }}>
            <ImageIcon className="w-7 h-7" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-2)" }}>Nenhum criativo encontrado</p>
          <p style={{ fontSize: 14, color: "var(--text-4)", marginTop: 6, maxWidth: 360, margin: "8px auto 0" }}>
            Clique em "Sincronizar" no topo para carregar seus criativos do Meta Ads.
          </p>
        </div>
      ) : isConnected && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2.5} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar criativo..."
                  className="input pl-8 py-2 text-[13px] w-52" />
              </div>
              {formats.length > 1 && (
                <select value={formatFilter} onChange={(e) => setFormat(e.target.value)} className="select py-2 text-[13px]">
                  {formats.map((f) => <option key={f} value={f}>{f === "ALL" ? "Todos os formatos" : f}</option>)}
                </select>
              )}
              <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="select py-2 text-[13px]">
                <option value="ALL">Todos os status</option>
                <option value="ACTIVE">Ativos</option>
                <option value="PAUSED">Pausados</option>
              </select>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--bg-muted)" }}>
              <button onClick={() => setView("grid")}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: view === "grid" ? "var(--surface)" : "transparent", color: view === "grid" ? "var(--blue)" : "var(--text-4)", boxShadow: view === "grid" ? "var(--shadow-xs)" : "none" }}>
                <Grid className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <button onClick={() => setView("list")}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: view === "list" ? "var(--surface)" : "transparent", color: view === "list" ? "var(--blue)" : "var(--text-4)", boxShadow: view === "list" ? "var(--shadow-xs)" : "none" }}>
                <List className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Grid / List */}
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <div className="card p-12 text-center">
                  <p style={{ fontSize: 14, color: "var(--text-4)" }}>Nenhum criativo encontrado com esses filtros</p>
                </div>
              ) : view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((c) => (
                    <div key={c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}
                      className="card overflow-hidden cursor-pointer transition-all duration-150"
                      style={{ borderColor: selected === c.id ? "var(--blue)" : "var(--border)", boxShadow: selected === c.id ? "0 0 0 2px rgba(37,99,235,0.15)" : "var(--shadow-xs)" }}>
                      {/* Thumb */}
                      <div className="relative aspect-video overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                        {c.thumb ? (
                          <img src={c.thumb} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <ImageIcon className="w-8 h-8" style={{ color: "var(--border-2)" }} strokeWidth={1.5} />
                            <span style={{ fontSize: 11, color: "var(--text-4)" }}>Sem preview</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className={cn("badge border text-[10px]", FORMAT_COLORS[c.format] ?? "badge-neutral")}>{c.format}</span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={cn("badge border text-[10px]", c.status === "ACTIVE" ? "bg-green-500/15 text-green-500 border-green-500/25" : "badge-neutral")}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", c.status === "ACTIVE" ? "bg-green-500 animate-pulse" : "bg-slate-400")} />
                            {c.status === "ACTIVE" ? "Ativo" : "Pausado"}
                          </span>
                        </div>
                        {/* Hook rate overlay */}
                        <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Hook Rate</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: c.hookRate >= 60 ? "#4ade80" : c.hookRate >= 40 ? "#fbbf24" : "#f87171" }}>{c.hookRate}%</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                            <div className="h-full rounded-full" style={{ width: `${c.hookRate}%`, background: c.hookRate >= 60 ? "#4ade80" : c.hookRate >= 40 ? "#fbbf24" : "#f87171" }} />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3.5">
                        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-1)" }} title={c.name}>{c.name}</p>
                        {c.campaign && <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-4)" }}>{c.campaign}</p>}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div>
                            <p className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--text-4)" }}><Eye className="w-2.5 h-2.5" /> Impressões</p>
                            <p className="text-[12px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{fmtCompact(c.impressions)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--text-4)" }}><MousePointerClick className="w-2.5 h-2.5" /> CTR</p>
                            <p className="text-[12px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{fmtPct(c.ctr)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--text-4)" }}><TrendingUp className="w-2.5 h-2.5" /> CPL</p>
                            <p className="text-[12px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{c.cpl > 0 ? fmtCurrency(c.cpl) : "—"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                        {["Criativo", "Formato", "Status", "Hook Rate", "Impressões", "CTR", "CPL", "Gasto"].map((h) => (
                          <th key={h} className={cn("px-4 py-3 text-left whitespace-nowrap")}
                            style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr key={c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}
                          className="border-b cursor-pointer transition-colors duration-100"
                          style={{ borderColor: "var(--border)", background: selected === c.id ? "var(--blue-light)" : "transparent" }}
                          onMouseEnter={(e) => { if (selected !== c.id) (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)"; }}
                          onMouseLeave={(e) => { if (selected !== c.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
                                {c.thumb ? <img src={c.thumb} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />}
                              </div>
                              <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{c.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className={cn("badge border text-[10px]", FORMAT_COLORS[c.format] ?? "badge-neutral")}>{c.format}</span></td>
                          <td className="px-4 py-3"><span className={cn("badge border text-[10px]", c.status === "ACTIVE" ? "bg-green-500/15 text-green-500 border-green-500/25" : "badge-neutral")}>{c.status === "ACTIVE" ? "Ativo" : "Pausado"}</span></td>
                          <td className="px-4 py-3 w-32"><HookRateBar value={c.hookRate} /></td>
                          <td className="px-4 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCompact(c.impressions)}</td>
                          <td className="px-4 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtPct(c.ctr)}</td>
                          <td className="px-4 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{c.cpl > 0 ? fmtCurrency(c.cpl) : "—"}</td>
                          <td className="px-4 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCurrency(c.spend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selectedCreative && (
              <div className="w-64 shrink-0 card overflow-hidden self-start sticky top-4">
                <div className="aspect-video overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                  {selectedCreative.thumb
                    ? <img src={selectedCreative.thumb} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8" style={{ color: "var(--text-4)" }} strokeWidth={1.5} /></div>}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{selectedCreative.name}</p>
                    {selectedCreative.campaign && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-4)" }}>{selectedCreative.campaign}</p>}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Impressões", value: fmtCompact(selectedCreative.impressions) },
                      { label: "Cliques",    value: fmtCompact(selectedCreative.clicks) },
                      { label: "CTR",        value: fmtPct(selectedCreative.ctr) },
                      { label: "CPL",        value: selectedCreative.cpl > 0 ? fmtCurrency(selectedCreative.cpl) : "—" },
                      { label: "Gasto",      value: fmtCurrency(selectedCreative.spend) },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center justify-between">
                        <span style={{ fontSize: 12, color: "var(--text-4)" }}>{m.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>{m.value}</span>
                      </div>
                    ))}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: 12, color: "var(--text-4)" }}>Hook Rate</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: selectedCreative.hookRate >= 60 ? "var(--green)" : selectedCreative.hookRate >= 40 ? "var(--yellow)" : "var(--red)" }}>
                          {selectedCreative.hookRate}%
                        </span>
                      </div>
                      <HookRateBar value={selectedCreative.hookRate} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <button className="btn-primary flex-1 py-2 text-[12px]">
                      <BarChart2 className="w-3.5 h-3.5" strokeWidth={2.5} /> Analisar
                    </button>
                    <button className="btn-secondary p-2">
                      <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
