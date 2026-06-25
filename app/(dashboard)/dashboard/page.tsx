"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useFilterStore, PERIOD_MULTIPLIERS } from "@/store/useFilterStore";
import { runRefresh } from "@/hooks/useMetaData";
import { safeArray } from "@/lib/safeArray";
import { fmtCurrency, fmtPct } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { SalesByProduct } from "@/components/dashboard/SalesByProduct";
import { SalesTable } from "@/components/dashboard/SalesTable";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { HourlyHeatmap } from "@/components/dashboard/HourlyHeatmap";
import { AudienceChart } from "@/components/dashboard/AudienceChart";
import { CampaignsTable } from "@/components/meta/CampaignsTable";
import { ChatAssistant } from "@/components/chat/ChatAssistant";
import { MainChart } from "@/components/dashboard/MainChart";
import { ConnectGuide } from "@/components/shared/ConnectGuide";
import { Facebook, AlertCircle, Bot, TrendingUp } from "lucide-react";

const META_STEPS = [
  { title: "Acesse o Meta for Developers", description: "Crie ou acesse seu app.", link: { label: "Meta for Developers", url: "https://developers.facebook.com" } },
  { title: "Crie um App Business", description: "Clique em 'Criar App' → selecione 'Business'." },
  { title: "Adicione a Marketing API", description: "Em 'Adicionar produto' → selecione 'Marketing API'." },
  { title: "Gere um Access Token", description: "Ferramentas → Graph API Explorer → gere token com ads_read, ads_management.", link: { label: "Graph API Explorer", url: "https://developers.facebook.com/tools/explorer" } },
  { title: "Encontre seu Ad Account ID", description: "No Gerenciador de Anúncios, o ID aparece na URL.", link: { label: "Gerenciador de Anúncios", url: "https://www.facebook.com/adsmanager" } },
  { title: "Cole no Trackfy", description: "Configurações → Meta Ads → cole Token e Account ID → Salvar e Sincronizar." },
];

export default function DashboardPage() {
  const { campaigns, adsets, ads, isLoading, apiError, token, accountId } = useAppStore();
  const { period } = useFilterStore();
  const isConnected = !!(token && accountId);

  useEffect(() => {
    if (isConnected) runRefresh();
  }, [token, accountId]);

  const list  = safeArray(campaigns);
  const mult  = PERIOD_MULTIPLIERS[period] ?? 1;
  const scale = mult > 1 ? mult / 7 : 1;

  const hasData = isConnected && list.length > 0;

  // Apenas dados reais — sem multiplicadores ou estimativas sintéticas.
  const gastoAds      = hasData ? list.reduce((s, c) => s + c.spend, 0) * scale : 0;
  const conversoes    = hasData ? list.reduce((s, c) => s + c.conversions, 0) * scale : 0;

  // Os campos abaixo só serão preenchidos quando o módulo Financeiro
  // (importação CSV de vendas reais) estiver populado pelo usuário.
  const faturamento   = 0;
  const custosProduto = 0;
  const impostos      = 0;
  const taxas         = 0;
  const despesas      = 0;
  const lucro         = faturamento - gastoAds - custosProduto - impostos - taxas - despesas;
  const roas          = gastoAds > 0 && faturamento > 0 ? faturamento / gastoAds : 0;
  const roi           = gastoAds > 0 && lucro !== 0 ? (lucro / gastoAds) * 100 : 0;
  const margem        = faturamento > 0 ? (lucro / faturamento) * 100 : 0;
  const vendasPend    = 0;
  const reembolsos    = 0;
  const reembolsosPct = 0;

  const metrics = [
    { label: "Faturamento Líquido",  value: fmtCurrency(faturamento),    tooltip: "Receita total gerada pelas vendas, descontando reembolsos. Importe vendas em Despesas/Financeiro." },
    { label: "Gastos com anúncios",  value: fmtCurrency(gastoAds),       tooltip: "Total investido em anúncios pagos no período." },
    { label: "ROAS",                 value: roas > 0 ? `${roas.toFixed(2)}x` : "N/A",         tooltip: "Return on Ad Spend = Faturamento ÷ Gasto.",                                   highlight: roas >= 2 ? "green" as const : roas > 0 ? "yellow" as const : undefined },
    { label: "Lucro",                value: fmtCurrency(lucro),          tooltip: "Faturamento − Gasto Ads − Custos − Impostos − Taxas.",                                            highlight: lucro > 0 ? "green" as const : lucro < 0 ? "red" as const : undefined },
    { label: "Vendas Pendentes",     value: fmtCurrency(vendasPend),     tooltip: "Vendas realizadas mas ainda não confirmadas." },
    { label: "ROI",                  value: roi !== 0 ? `${roi.toFixed(1)}%` : "N/A",        tooltip: "Return on Investment = (Lucro ÷ Gasto Ads) × 100.",                            highlight: roi > 0 ? "green" as const : roi < 0 ? "red" as const : undefined },
    { label: "Custos de Produto",    value: fmtCurrency(custosProduto),  tooltip: "Custo de aquisição ou produção dos produtos vendidos." },
    { label: "Vendas Reembolsadas",  value: fmtCurrency(reembolsos),     tooltip: "Total de vendas reembolsadas ou estornadas." },
    { label: "Margem",               value: margem !== 0 ? `${margem.toFixed(1)}%` : "N/A", tooltip: "Margem de Lucro = (Lucro ÷ Faturamento) × 100." },
    { label: "Despesas adicionais",  value: fmtCurrency(despesas),       tooltip: "Despesas operacionais extras." },
    { label: "Imposto sobre vendas", value: fmtCurrency(impostos),       tooltip: "Impostos incidentes sobre as vendas." },
    { label: "Reembolso",            value: `${reembolsosPct.toFixed(1)}%`, tooltip: "Taxa de reembolso = (Reembolsos ÷ Faturamento) × 100." },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Dashboard</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>
            Visão geral das suas campanhas
            {isLoading && <span className="ml-2 font-medium" style={{ color: "var(--blue)" }}>— sincronizando...</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <ErrorBoundary><FilterBar /></ErrorBoundary>

      {/* Alerts */}
      <ErrorBoundary><AlertBanner /></ErrorBoundary>

      {/* API Error */}
      {apiError && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: "var(--red-light)", border: "1px solid rgba(220,38,38,0.15)" }}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--red)" }} strokeWidth={2} />
          <p className="text-[13px]" style={{ color: "var(--text-2)" }}>
            {apiError}{" "}
            <a href="/dashboard/settings" className="font-semibold underline" style={{ color: "var(--blue)" }}>Configurações</a>
          </p>
        </div>
      )}

      {/* Connect guide */}
      {!isConnected && (
        <>
          <ConnectGuide platform="Meta Ads"
            icon={<Facebook className="w-5 h-5 text-white" strokeWidth={2} />}
            color="bg-blue-600"
            steps={META_STEPS} />
          <div className="card p-5">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Dashboard de anúncios aguardando conexão</h2>
            <p className="text-[13px] mt-2" style={{ color: "var(--text-4)" }}>Conecte uma conta Meta Ads para ver gasto, campanhas e criativos. Enquanto isso, acompanhe suas visitas, UTMs e funil em Dados no Trackfy.</p>
            <a href="/dashboard/utms" className="btn-secondary mt-4 w-fit px-4 py-2">Abrir rastreamento do site</a>
          </div>
        </>
      )}

      {/* Metrics + Sales chart */}
      {isConnected && <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <ErrorBoundary key={m.label}>
              <MetricCard {...m} loading={isLoading} />
            </ErrorBoundary>
          ))}
        </div>
        <div className="xl:col-span-1">
          <ErrorBoundary><SalesByProduct /></ErrorBoundary>
        </div>
      </div>}

      {/* Performance chart + AI insight */}
      {isConnected && hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <h2 className="text-[14px] font-bold mb-4" style={{ color: "var(--text-1)" }}>
              Performance — Investido vs Conversões
            </h2>
            <ErrorBoundary><MainChart /></ErrorBoundary>
          </div>

          {/* AI insight card */}
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--blue-muted)" }}>
                <Bot className="w-3.5 h-3.5" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
              </div>
              <span className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Recomendação IA</span>
            </div>
            <p className="text-[13px] leading-relaxed flex-1" style={{ color: "var(--text-3)" }}>
              Pergunte à IA sobre seus resultados. Use o assistente no canto inferior direito
              para receber sugestões com base nas métricas atuais.
            </p>
            <button
              type="button"
              onClick={() => {
                const ev = new CustomEvent("trackfy:open-chat");
                window.dispatchEvent(ev);
              }}
              className="btn-primary w-full py-2"
            >
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              Abrir assistente
            </button>
          </div>
        </div>
      )}

      {/* Funnel + Heatmap */}
      {isConnected && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ErrorBoundary><ConversionFunnel /></ErrorBoundary>
        <ErrorBoundary><HourlyHeatmap /></ErrorBoundary>
      </div>}

      {/* Audience + Sales table */}
      {isConnected && <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ErrorBoundary><AudienceChart /></ErrorBoundary>
        </div>
        <div className="lg:col-span-2">
          <ErrorBoundary><SalesTable /></ErrorBoundary>
        </div>
      </div>}

      {/* Campaign management */}
      {isConnected && <div>
        <h2 className="text-[15px] font-bold mb-3" style={{ color: "var(--text-1)" }}>Campaign Management</h2>
        <ErrorBoundary>
          <CampaignsTable campaigns={list} adsets={safeArray(adsets)} ads={safeArray(ads)} />
        </ErrorBoundary>
      </div>}

      <ChatAssistant />
    </div>
  );
}
