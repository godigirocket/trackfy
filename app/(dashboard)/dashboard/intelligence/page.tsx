"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BadgeDollarSign, CheckCircle, Lightbulb, RefreshCw, Target } from "lucide-react";

type Channel = { channel: string; visits: number; leads: number; checkouts: number; paidOrders: number; refunds: number; revenue: number; netRevenue: number; conversionRate: number };
type Campaign = { source: string; medium: string; campaign: string; visits: number; paidOrders: number; refunds: number; revenue: number; netRevenue: number; conversionRate: number; averageOrder: number };
type IntelligenceData = { totals: { visits: number; leads: number; checkouts: number; purchases: number; paidOrders: number; refundedOrders: number; revenue: number; refunds: number }; channels: Channel[]; campaigns: Campaign[] };

const TRACKER_KEY = "tf_native_tracker";
const SETTINGS_KEY = "tf_intelligence_targets";
function money(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }

export default function IntelligencePage() {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [targets, setTargets] = useState({ maxCpa: "35", minRoas: "2", minConversion: "1.5" });

  useEffect(() => { try { setTargets({ ...targets, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") }); } catch { /* defaults */ } }, []);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(targets)); }, [targets]);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const tracker = JSON.parse(localStorage.getItem(TRACKER_KEY) ?? "{}");
      if (!tracker.siteId) throw new Error("Instale o rastreamento primeiro em UTMs.");
      const response = await fetch(`/api/tracking?siteId=${encodeURIComponent(tracker.siteId)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível carregar inteligência.");
      setData(result);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível carregar inteligência."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const analysis = useMemo(() => {
    if (!data) return { score: 0, insights: [] as Array<{ title: string; text: string; tone: "green" | "yellow" | "red" }> };
    const { totals } = data;
    const conversion = totals.visits > 0 ? (totals.paidOrders / totals.visits) * 100 : 0;
    const trackedShare = totals.purchases > 0 ? Math.min(100, (totals.paidOrders / totals.purchases) * 100) : totals.paidOrders > 0 ? 100 : 0;
    const score = Math.round(Math.min(100, (totals.visits > 0 ? 25 : 0) + (totals.leads > 0 ? 20 : 0) + (totals.checkouts > 0 ? 15 : 0) + (totals.paidOrders > 0 ? 25 : 0) + (trackedShare >= 80 ? 15 : 0)));
    const insights: Array<{ title: string; text: string; tone: "green" | "yellow" | "red" }> = [];
    if (totals.visits > 30 && totals.leads === 0) insights.push({ title: "Página sem captura", text: "Há visitas suficientes, mas nenhum lead. Teste CTA, formulário, promessa e velocidade antes de aumentar tráfego.", tone: "red" });
    if (totals.leads > 0 && totals.checkouts === 0) insights.push({ title: "Lead não avança", text: "O gargalo está entre interesse e checkout. Teste prova, oferta, follow-up e CTA de pagamento.", tone: "yellow" });
    if (totals.checkouts > 0 && totals.paidOrders === 0) insights.push({ title: "Checkout sem pagamento confirmado", text: "Revise preço, meios de pagamento, confiança e o webhook do checkout.", tone: "red" });
    if (conversion > 0 && conversion < Number(targets.minConversion)) insights.push({ title: "Conversão abaixo da meta", text: `A taxa atual é ${conversion.toFixed(2)}%. Antes de escalar, melhore página ou oferta até sua meta de ${targets.minConversion}%.`, tone: "yellow" });
    const winner = data.campaigns.find((campaign) => campaign.netRevenue > 0);
    if (winner) insights.push({ title: "Campanha com receita", text: `${winner.campaign} trouxe ${money(winner.netRevenue)} líquido em receita rastreada. Crie uma variação do mesmo ângulo antes de abrir novos testes.`, tone: "green" });
    if (!insights.length) insights.push({ title: "Aguardando dados suficientes", text: "Instale o script, use UTMs e conecte o webhook de pagamento. A inteligência aparece com tráfego e pedidos reais.", tone: "yellow" });
    return { score, insights };
  }, [data, targets]);

  return <div className="max-w-[1300px] mx-auto space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-[20px] font-bold" style={{ color: "var(--text-1)" }}>Inteligência</h1><p className="text-[13px] mt-1" style={{ color: "var(--text-4)" }}>Decisões a partir de tráfego, UTMs, pedidos e receita reais.</p></div><button onClick={load} disabled={loading} className="btn-secondary px-3 py-2"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Atualizar</button></div>

    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5"><div className="card p-5"><div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ border: "7px solid var(--blue-muted)" }}><span className="text-[22px] font-bold" style={{ color: "var(--blue)" }}>{analysis.score}</span></div><p className="text-center text-[13px] font-bold mt-3" style={{ color: "var(--text-1)" }}>Qualidade da operação</p><p className="text-center text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Cobertura de tracking e funil, não é previsão de lucro.</p></div>
      <div className="card p-5"><div className="flex items-center gap-2"><Lightbulb className="w-4 h-4" style={{ color: "var(--blue)" }} /><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Próximas ações</h2></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">{analysis.insights.map((insight) => <div key={insight.title} className="p-4 rounded-lg" style={{ background: insight.tone === "green" ? "var(--green-light)" : insight.tone === "red" ? "var(--red-light)" : "var(--yellow-light)" }}><p className="text-[13px] font-bold" style={{ color: "var(--text-2)" }}>{insight.title}</p><p className="text-[12px] leading-relaxed mt-1" style={{ color: "var(--text-3)" }}>{insight.text}</p></div>)}</div></div></div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[{ label: "CPA máximo", key: "maxCpa", suffix: "R$" }, { label: "ROAS mínimo", key: "minRoas", suffix: "x" }, { label: "Conversão mínima", key: "minConversion", suffix: "%" }].map((item) => <div key={item.key} className="card p-4"><div className="flex items-center gap-2"><Target className="w-4 h-4" style={{ color: "var(--blue)" }} /><label className="text-[12px] font-semibold" style={{ color: "var(--text-4)" }}>{item.label}</label></div><div className="flex items-center gap-2 mt-3"><input value={targets[item.key as keyof typeof targets]} onChange={(event) => setTargets((values) => ({ ...values, [item.key]: event.target.value }))} inputMode="decimal" className="input" /><span className="text-[13px] font-bold" style={{ color: "var(--text-4)" }}>{item.suffix}</span></div></div>)}</div>

    {error ? <div className="card p-8 text-center"><AlertTriangle className="w-8 h-8 mx-auto" style={{ color: "var(--yellow)" }} /><p className="text-[13px] mt-3" style={{ color: "var(--text-3)" }}>{error}</p></div> : data && <><div className="card overflow-hidden"><div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Lucro por origem</h2><p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Receita líquida usa pedidos pagos menos reembolsos recebidos por webhook.</p></div><div className="overflow-x-auto"><table className="w-full text-left"><thead style={{ background: "var(--bg-subtle)" }}><tr>{["Origem", "Visitas", "Leads", "Pedidos", "Receita líquida", "Conversão"].map((item) => <th key={item} className="px-5 py-3 text-[11px] uppercase" style={{ color: "var(--text-4)" }}>{item}</th>)}</tr></thead><tbody>{data.channels.map((channel) => <tr key={channel.channel} className="border-t" style={{ borderColor: "var(--border)" }}><td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--text-2)" }}>{channel.channel}</td><td className="px-5 py-3 text-[13px]">{channel.visits}</td><td className="px-5 py-3 text-[13px]">{channel.leads}</td><td className="px-5 py-3 text-[13px]">{channel.paidOrders}</td><td className="px-5 py-3 text-[13px] font-bold" style={{ color: channel.netRevenue > 0 ? "var(--green)" : "var(--text-3)" }}>{money(channel.netRevenue)}</td><td className="px-5 py-3 text-[13px]">{channel.conversionRate.toFixed(2)}%</td></tr>)}</tbody></table></div></div>
    <div className="card overflow-hidden"><div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}><BadgeDollarSign className="w-4 h-4" style={{ color: "var(--blue)" }} /><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Ranking de campanhas por receita</h2></div>{data.campaigns.length === 0 ? <p className="p-8 text-[13px]" style={{ color: "var(--text-4)" }}>Use UTMs e envie source, medium e campaign no webhook para preencher este ranking.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead style={{ background: "var(--bg-subtle)" }}><tr>{["Campanha", "Origem", "Visitas", "Pedidos", "Receita", "Ticket", "Conversão"].map((item) => <th key={item} className="px-5 py-3 text-[11px] uppercase" style={{ color: "var(--text-4)" }}>{item}</th>)}</tr></thead><tbody>{data.campaigns.map((campaign) => <tr key={`${campaign.source}-${campaign.campaign}`} className="border-t" style={{ borderColor: "var(--border)" }}><td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--text-2)" }}>{campaign.campaign}</td><td className="px-5 py-3 text-[13px]">{campaign.source}/{campaign.medium}</td><td className="px-5 py-3 text-[13px]">{campaign.visits}</td><td className="px-5 py-3 text-[13px]">{campaign.paidOrders}</td><td className="px-5 py-3 text-[13px] font-bold" style={{ color: campaign.netRevenue > 0 ? "var(--green)" : "var(--text-3)" }}>{money(campaign.netRevenue)}</td><td className="px-5 py-3 text-[13px]">{money(campaign.averageOrder)}</td><td className="px-5 py-3 text-[13px]">{campaign.conversionRate.toFixed(2)}%</td></tr>)}</tbody></table></div>}</div></>}
  </div>;
}
