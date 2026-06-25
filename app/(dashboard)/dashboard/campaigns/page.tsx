"use client";
import { useEffect, useState } from "react";
import { Facebook, Plus, RefreshCw, Settings, Download, Filter, ChevronDown, Search, BarChart2, Eye, Pause, Play, Copy, Trash2, AlertCircle, TrendingUp, TrendingDown, Target, DollarSign, MousePointerClick, Users } from "lucide-react";
import { CampaignsTable } from "@/components/meta/CampaignsTable";
import { ChatAssistant } from "@/components/chat/ChatAssistant";
import { ConnectGuide } from "@/components/shared/ConnectGuide";
import { useAppStore } from "@/store/useAppStore";
import { runRefresh } from "@/hooks/useMetaData";
import { safeArray } from "@/lib/safeArray";
import { fmtCurrency, fmtPct, fmtCompact, cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const META_STEPS = [
  { title: "Acesse o Meta for Developers", description: "Crie ou acesse seu app.", link: { label: "Meta for Developers", url: "https://developers.facebook.com" } },
  { title: "Crie um App Business", description: "Clique em 'Criar App' → selecione 'Business'." },
  { title: "Adicione a Marketing API", description: "Em 'Adicionar produto' → selecione 'Marketing API'." },
  { title: "Gere um Access Token", description: "Ferramentas → Graph API Explorer → gere token com ads_read, ads_management.", link: { label: "Graph API Explorer", url: "https://developers.facebook.com/tools/explorer" } },
  { title: "Encontre seu Ad Account ID", description: "No Gerenciador de Anúncios, o ID aparece na URL.", link: { label: "Gerenciador de Anúncios", url: "https://www.facebook.com/adsmanager" } },
  { title: "Cole no Trackfy", description: "Configurações → Meta Ads → cole Token e Account ID → Salvar e Sincronizar." },
];

export default function CampaignsPage() {
  const { campaigns, adsets, ads, isLoading, apiError, token, accountId } = useAppStore();
  const isConnected = !!(token && accountId);
  const [view, setView] = useState<"campaigns" | "adsets" | "ads">("campaigns");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { if (isConnected) runRefresh(); }, [token, accountId]);

  const list = safeArray(campaigns);
  const totalSpend = list.reduce((s, c) => s + c.spend, 0);
  const totalConv  = list.reduce((s, c) => s + c.conversions, 0);
  const totalImpr  = list.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = list.reduce((s, c) => s + c.clicks, 0);
  const avgCTR     = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;
  const avgCPL     = totalConv > 0 ? totalSpend / totalConv : 0;
  const active     = list.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--blue-muted)" }}>
            <Facebook className="w-4.5 h-4.5" style={{ color: "var(--blue)" }} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Meta Ads</h1>
            <p className="text-[13px]" style={{ color: "var(--text-4)" }}>
              Gerenciador de Anúncios
              {isLoading && <span className="ml-2" style={{ color: "var(--blue)" }}>— sincronizando...</span>}
            </p>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <button onClick={runRefresh} disabled={isLoading} className="btn-secondary px-3.5 py-2">
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} strokeWidth={2.5} />
              Sincronizar
            </button>
            <a href="https://www.facebook.com/adsmanager/creation" target="_blank" rel="noopener noreferrer"
              className="btn-primary px-4 py-2">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Nova Campanha
            </a>
          </div>
        )}
      </div>

      {!isConnected ? (
        <ConnectGuide platform="Meta Ads"
          icon={<Facebook className="w-5 h-5 text-white" strokeWidth={2} />}
          color="bg-blue-600" steps={META_STEPS} />
      ) : (
        <>
          {apiError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: "var(--red-light)", border: "1px solid rgba(220,38,38,0.15)" }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--red)" }} strokeWidth={2} />
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>{apiError}</p>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Campanhas",    value: list.length.toString(),       icon: BarChart2,        color: "var(--blue)" },
              { label: "Ativas",       value: active.toString(),            icon: Play,             color: "var(--green)" },
              { label: "Gasto Total",  value: fmtCurrency(totalSpend),      icon: DollarSign,       color: "var(--text-1)" },
              { label: "Conversões",   value: fmtCompact(totalConv),        icon: Target,           color: "var(--green)" },
              { label: "Impressões",   value: fmtCompact(totalImpr),        icon: Eye,              color: "var(--text-1)" },
              { label: "CTR Médio",    value: fmtPct(avgCTR),               icon: MousePointerClick, color: "var(--blue)" },
              { label: "CPL Médio",    value: fmtCurrency(avgCPL),          icon: Users,            color: "var(--text-1)" },
            ].map((k) => (
              <div key={k.label} className="card p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <k.icon className="w-3.5 h-3.5 shrink-0" style={{ color: k.color }} strokeWidth={2.5} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {k.label}
                  </span>
                </div>
                <p className="text-[18px] font-bold tabular-nums" style={{ color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Level tabs */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--bg-muted)" }}>
              {[
                { id: "campaigns", label: `Campanhas (${list.length})` },
                { id: "adsets",    label: `Conjuntos (${safeArray(adsets).length})` },
                { id: "ads",       label: `Anúncios (${safeArray(ads).length})` },
              ].map((t) => (
                <button key={t.id} onClick={() => setView(t.id as any)}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150"
                  style={{
                    background: view === t.id ? "var(--surface)" : "transparent",
                    color: view === t.id ? "var(--text-1)" : "var(--text-4)",
                    boxShadow: view === t.id ? "var(--shadow-sm)" : "none",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <ErrorBoundary>
            {view === "campaigns" && (
              <CampaignsTable campaigns={list} adsets={safeArray(adsets)} ads={safeArray(ads)} />
            )}
            {view === "adsets" && (
              <CampaignsTable campaigns={safeArray(adsets)} adsets={[]} ads={[]} />
            )}
            {view === "ads" && (
              <CampaignsTable campaigns={safeArray(ads)} adsets={[]} ads={[]} />
            )}
          </ErrorBoundary>
        </>
      )}

      <ChatAssistant />
    </div>
  );
}
