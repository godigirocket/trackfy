"use client";
import { useState } from "react";
import {
  Music2,
  Users,
  Target,
  TrendingUp,
  Eye,
  MousePointerClick,
  BarChart2,
  Smartphone,
  Globe,
  Inbox,
} from "lucide-react";
import { ConnectGuide } from "@/components/shared/ConnectGuide";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainChart } from "@/components/dashboard/MainChart";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { fmtCurrency, fmtCompact, cn } from "@/lib/utils";

const TIKTOK_STEPS = [
  {
    title: "Acesse o TikTok for Business",
    description: "Crie ou acesse sua conta no TikTok for Business.",
    link: { label: "Abrir TikTok for Business", url: "https://business.tiktok.com" },
  },
  {
    title: "Acesse o TikTok Developers",
    description: "Vá ao portal de desenvolvedores e crie um app do tipo Marketing API.",
    link: { label: "Abrir TikTok Developers", url: "https://developers.tiktok.com" },
  },
  {
    title: "Crie um App e obtenha as credenciais",
    description: "No painel do app, copie o App ID e o App Secret.",
  },
  {
    title: "Gere um Access Token",
    description:
      "Use o fluxo OAuth 2.0 para obter um Access Token com permissões: ad.read, ad.write, campaign.read.",
    link: {
      label: "Ver documentação OAuth",
      url: "https://ads.tiktok.com/marketing_api/docs?id=1738373164380162",
    },
  },
  {
    title: "Encontre seu Advertiser ID",
    description:
      "No TikTok Ads Manager, o Advertiser ID aparece no canto superior direito.",
    link: { label: "Abrir TikTok Ads Manager", url: "https://ads.tiktok.com" },
  },
  {
    title: "Cole as credenciais no Trackfy",
    description:
      "Vá em Configurações → TikTok Ads → cole o Access Token e o Advertiser ID → salve.",
  },
];

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: "var(--bg-muted)" }}
      >
        <Inbox className="w-5 h-5" style={{ color: "var(--text-4)" }} strokeWidth={2} />
      </div>
      <p className="text-[13px] font-semibold" style={{ color: "var(--text-3)" }}>
        {message}
      </p>
      <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>
        Os dados aparecerão aqui assim que sua conta TikTok Ads sincronizar.
      </p>
    </div>
  );
}

export default function TikTokPage() {
  const tiktokToken =
    typeof window !== "undefined" ? localStorage.getItem("tf_tiktok") : null;
  const isConnected = !!tiktokToken;
  const [tab, setTab] = useState<
    "overview" | "audience" | "creatives" | "placements"
  >("overview");

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: BarChart2 },
    { id: "audience", label: "Audiência", icon: Users },
    { id: "creatives", label: "Criativos", icon: Eye },
    { id: "placements", label: "Posicionamentos", icon: Smartphone },
  ] as const;

  // Sem dados reais ainda — todos os arrays vazios.
  const adsets: any[] = [];
  const creatives: any[] = [];
  const placements: any[] = [];
  const audienceAge: any[] = [];
  const audienceGender: any[] = [];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#1a1d2e" }}
        >
          <Music2 className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
            TikTok Ads — Analytics
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>
            Análise completa de audiência, criativos e posicionamentos
          </p>
        </div>
      </div>

      <ErrorBoundary>
        <FilterBar />
      </ErrorBoundary>

      {!isConnected ? (
        <ConnectGuide
          platform="TikTok Ads"
          icon={<Music2 className="w-5 h-5 text-white" strokeWidth={2} />}
          color="bg-[#1a1d2e] border border-[#2d3148]"
          steps={TIKTOK_STEPS}
        />
      ) : (
        <>
          {/* KPIs zerados até dados reais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Gasto Total", value: fmtCurrency(0), icon: TrendingUp, color: "var(--red)" },
              { label: "Impressões", value: "0", icon: Eye, color: "var(--blue)" },
              { label: "Conversões", value: "0", icon: Target, color: "var(--green)" },
              { label: "CPM Médio", value: fmtCurrency(0), icon: MousePointerClick, color: "var(--yellow)" },
            ].map((k) => (
              <div key={k.label} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className="w-4 h-4" style={{ color: k.color }} strokeWidth={2.5} />
                  <p
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-4)" }}
                  >
                    {k.label}
                  </p>
                </div>
                <p
                  className="text-[22px] font-bold tracking-tight"
                  style={{ color: k.color }}
                >
                  {k.value}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 rounded-xl p-1 w-fit"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
                style={{
                  background: tab === t.id ? "var(--surface)" : "transparent",
                  color: tab === t.id ? "var(--blue)" : "var(--text-3)",
                  boxShadow: tab === t.id ? "var(--shadow-xs)" : "none",
                }}
              >
                <t.icon className="w-4 h-4" strokeWidth={2.5} />
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-4">
              <div className="card p-5">
                <h2
                  className="text-[14px] font-bold mb-4"
                  style={{ color: "var(--text-1)" }}
                >
                  Performance TikTok Ads
                </h2>
                <ErrorBoundary>
                  <MainChart />
                </ErrorBoundary>
              </div>

              <div className="card overflow-hidden">
                <div
                  className="px-4 py-3.5 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h2
                    className="text-[14px] font-bold"
                    style={{ color: "var(--text-1)" }}
                  >
                    Conjuntos de Anúncios
                  </h2>
                </div>
                {adsets.length === 0 ? (
                  <EmptyState message="Sem conjuntos de anúncios" />
                ) : null}
              </div>
            </div>
          )}

          {tab === "audience" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h2
                  className="text-[14px] font-bold mb-4"
                  style={{ color: "var(--text-1)" }}
                >
                  Distribuição por Idade
                </h2>
                {audienceAge.length === 0 ? (
                  <EmptyState message="Dados de audiência não disponíveis" />
                ) : null}
              </div>

              <div className="card p-5">
                <h2
                  className="text-[14px] font-bold mb-4"
                  style={{ color: "var(--text-1)" }}
                >
                  Distribuição por Gênero
                </h2>
                {audienceGender.length === 0 ? (
                  <EmptyState message="Dados de gênero não disponíveis" />
                ) : null}
              </div>

              <div className="card p-5 lg:col-span-2">
                <h2
                  className="text-[14px] font-bold mb-4"
                  style={{ color: "var(--text-1)" }}
                >
                  Dispositivos & Sistemas Operacionais
                </h2>
                <EmptyState message="Dados de dispositivos não disponíveis" />
              </div>
            </div>
          )}

          {tab === "creatives" && (
            <div className="card overflow-hidden">
              <div
                className="px-4 py-3.5 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <h2
                  className="text-[14px] font-bold"
                  style={{ color: "var(--text-1)" }}
                >
                  Top Criativos TikTok
                </h2>
              </div>
              {creatives.length === 0 ? (
                <EmptyState message="Sem criativos para exibir" />
              ) : null}
            </div>
          )}

          {tab === "placements" && (
            <div className="card p-5">
              <h2
                className="text-[14px] font-bold mb-4"
                style={{ color: "var(--text-1)" }}
              >
                Posicionamentos
              </h2>
              {placements.length === 0 ? (
                <EmptyState message="Sem posicionamentos para exibir" />
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
