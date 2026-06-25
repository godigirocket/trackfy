"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart2, CheckCircle, DollarSign, Eye, Inbox, MousePointerClick, RefreshCw, Search, Target } from "lucide-react";
import { ConnectGuide } from "@/components/shared/ConnectGuide";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { fetchGoogleCampaigns } from "@/lib/google-ads/api";
import { PERIODS, type Period } from "@/lib/constants";
import { fmtCompact, fmtCurrency, fmtPct, cn } from "@/lib/utils";
import { getLocalUser } from "@/lib/localAuth";
import type { MetricRow } from "@/store/useAppStore";

const GOOGLE_STEPS = [
  {
    title: "Acesse o Google Cloud Console",
    description: "Crie um projeto ou use um existente no Google Cloud Console.",
    link: { label: "Abrir Google Cloud Console", url: "https://console.cloud.google.com" },
  },
  {
    title: "Ative a Google Ads API",
    description:
      "No menu 'APIs e Serviços' → 'Biblioteca' → busque 'Google Ads API' → clique em 'Ativar'.",
  },
  {
    title: "Crie credenciais OAuth 2.0",
    description:
      "Em 'APIs e Serviços' → 'Credenciais' → 'Criar credenciais' → 'ID do cliente OAuth' → tipo 'Aplicativo da Web'.",
  },
  {
    title: "Solicite um Developer Token",
    description:
      "Acesse o Google Ads → Ferramentas → API Center → solicite um token de desenvolvedor.",
    link: {
      label: "Abrir Google Ads API Center",
      url: "https://ads.google.com/aw/apicenter",
    },
  },
  {
    title: "Obtenha o Customer ID",
    description:
      "No Google Ads, o Customer ID aparece no canto superior direito no formato XXX-XXX-XXXX. Cole no Trackfy sem hífens.",
    link: { label: "Abrir Google Ads", url: "https://ads.google.com" },
  },
  {
    title: "Cole as credenciais no Trackfy",
    description: "Vá em Configurações → Google Ads → informe Customer ID e conecte via OAuth. O Trackfy renova o token automaticamente.",
  },
];

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  ARCHIVED: "Arquivada",
  DELETED: "Removida",
};

export default function GooglePage() {
  const [connectionId, setConnectionId] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [period, setPeriod] = useState<Period>("7D");
  const [campaigns, setCampaigns] = useState<MetricRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const isConnected = !!connectionId && connectionStatus !== "needs_reauth";
  const currentUserId = () => getLocalUser()?.email ?? "";

  const loadConnection = async () => {
    const userId = currentUserId();
    if (!userId) return "";
    const res = await fetch(`/api/google-ads/connections?user_id=${encodeURIComponent(userId)}`);
    const data = await res.json();
    const active = (data.connections ?? []).find((c: any) => c.status === "active") ?? (data.connections ?? [])[0];
    setConnectionId(active?.id ?? "");
    setConnectionStatus(active?.status ?? "");
    return active?.id ?? "";
  };

  const syncGoogleAds = async (signal?: AbortSignal) => {
    const userId = currentUserId();
    if (!userId) {
      setApiError("Entre na sua conta Trackfy para sincronizar o Google Ads.");
      return;
    }
    const id = connectionId || await loadConnection();
    if (!id) return;

    setIsLoading(true);
    setApiError(null);
    try {
      const data = await fetchGoogleCampaigns({ connectionId: id, userId }, period, signal);
      setCampaigns(data);
      setLastSync(new Date());
    } catch (e: any) {
      setApiError(e.message ?? "Não foi possível sincronizar o Google Ads.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadConnection().then((id) => {
      if (id) syncGoogleAds(controller.signal);
    });
    return () => controller.abort();
  }, [period]);

  const totals = useMemo(() => {
    const spend = campaigns.reduce((s, c) => s + c.spend, 0);
    const conversions = campaigns.reduce((s, c) => s + c.conversions, 0);
    const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);

    return {
      spend,
      conversions,
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      active: campaigns.filter((c) => c.status === "ACTIVE").length,
    };
  }, [campaigns]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--bg-muted)" }}
          >
            <Search
              className="w-4 h-4"
              style={{ color: "var(--text-1)" }}
              strokeWidth={2.5}
            />
          </div>
          <div>
            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
              Google Ads
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>
              Performance das campanhas Google
              {isLoading && <span className="ml-2" style={{ color: "var(--blue)" }}>sincronizando...</span>}
            </p>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2">
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="select py-2 text-[12px] w-28">
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={() => syncGoogleAds()} disabled={isLoading} className="btn-secondary px-3.5 py-2">
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} strokeWidth={2.5} />
              Sincronizar
            </button>
          </div>
        )}
      </div>

      <ErrorBoundary>
        <FilterBar />
      </ErrorBoundary>

      {!isConnected ? (
        <ConnectGuide
          platform="Google Ads"
          icon={<Search className="w-5 h-5 text-white" strokeWidth={2} />}
          color="bg-red-500"
          steps={GOOGLE_STEPS}
        />
      ) : (
        <>
          {apiError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: "var(--red-light)", border: "1px solid rgba(220,38,38,0.15)" }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--red)" }} strokeWidth={2} />
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Campanhas", value: campaigns.length.toString(), icon: BarChart2, color: "var(--blue)" },
              { label: "Ativas", value: totals.active.toString(), icon: CheckCircle, color: "var(--green)" },
              { label: "Gasto Total", value: fmtCurrency(totals.spend), icon: DollarSign, color: "var(--text-1)" },
              { label: "Conversões", value: fmtCompact(totals.conversions), icon: Target, color: "var(--green)" },
              { label: "Impressões", value: fmtCompact(totals.impressions), icon: Eye, color: "var(--text-1)" },
              { label: "CTR Médio", value: fmtPct(totals.ctr), icon: MousePointerClick, color: "var(--blue)" },
              { label: "CPC Médio", value: fmtCurrency(totals.cpc), icon: MousePointerClick, color: "var(--yellow)" },
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

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>
                Campanhas Google
              </h2>
              {lastSync && (
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-4)" }}>
                  Atualizado {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                    {["Nome", "Status", "Canal", "Conversões", "Orçamento", "Gasto", "Cliques", "CTR"].map((h) => (
                      <th key={h} className={cn("px-4 py-3 whitespace-nowrap", ["Conversões", "Orçamento", "Gasto", "Cliques", "CTR"].includes(h) ? "text-right" : "text-left")}
                        style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-4)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--bg-muted)" }}>
                            <Inbox className="w-5 h-5" style={{ color: "var(--text-4)" }} strokeWidth={2} />
                          </div>
                          <p className="text-[13px] font-semibold" style={{ color: "var(--text-3)" }}>
                            Sem campanhas para exibir
                          </p>
                          <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>
                            Sincronize uma conta Google Ads com campanhas no período selecionado.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3 min-w-[260px]">
                        <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{campaign.name}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-4)" }}>{campaign.id}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="badge" style={{
                          background: campaign.status === "ACTIVE" ? "var(--green-light)" : "var(--bg-muted)",
                          color: campaign.status === "ACTIVE" ? "var(--green)" : "var(--text-3)",
                        }}>
                          {STATUS_LABEL[campaign.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] whitespace-nowrap" style={{ color: "var(--text-2)" }}>{campaign.objective ?? "-"}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{fmtCompact(campaign.conversions)}</td>
                      <td className="px-4 py-3 text-right text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCurrency(campaign.budget)}</td>
                      <td className="px-4 py-3 text-right text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCurrency(campaign.spend)}</td>
                      <td className="px-4 py-3 text-right text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCompact(campaign.clicks)}</td>
                      <td className="px-4 py-3 text-right text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtPct(campaign.ctr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
