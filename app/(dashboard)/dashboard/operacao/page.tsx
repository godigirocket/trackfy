"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Copy, Database, Download, DollarSign, Plus, Target, TrendingUp, Webhook } from "lucide-react";

type Sale = { id: string; value: number; createdAt: string };
type CreativeNote = { id: string; name: string; angle: string; hook: string; ctr: number; cpa: number; status: "testar" | "vencedor" | "pausado" };
type TrackingData = { visits: number; leads: number; checkouts: number; purchases: number; paidOrders: number; refundedOrders: number; revenue: number; refunds: number };

const OPERATION_KEY = "tf_operation_center";
const TRACKER_KEY = "tf_native_tracker";

function money(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }
function today() { return new Date().toLocaleDateString("pt-BR"); }
function copyText(value: string) { navigator.clipboard.writeText(value); }

export default function OperationPage() {
  const [goal, setGoal] = useState("1000");
  const [adSpend, setAdSpend] = useState("0");
  const [productCost, setProductCost] = useState("0");
  const [saleValue, setSaleValue] = useState("97");
  const [sales, setSales] = useState<Sale[]>([]);
  const [creative, setCreative] = useState({ name: "", angle: "", hook: "", ctr: "", cpa: "" });
  const [creatives, setCreatives] = useState<CreativeNote[]>([]);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [orders, setOrders] = useState<Array<{ transactionId: string; status: string; value: number; currency: string; product: string | null; source: string; campaign: string; updatedAt: string }>>([]);
  const [trackingStatus, setTrackingStatus] = useState<"loading" | "active" | "unavailable">("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(OPERATION_KEY) ?? "{}");
      setGoal(stored.goal ?? "1000"); setAdSpend(stored.adSpend ?? "0"); setProductCost(stored.productCost ?? "0");
      setSales(stored.sales ?? []); setCreatives(stored.creatives ?? []);
    } catch { /* inicia vazio */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(OPERATION_KEY, JSON.stringify({ goal, adSpend, productCost, sales, creatives }));
  }, [goal, adSpend, productCost, sales, creatives]);

  const refreshTracking = async () => {
    try {
      const [health, tracker] = await Promise.all([fetch("/api/system/supabase-status", { cache: "no-store" }), Promise.resolve(JSON.parse(localStorage.getItem(TRACKER_KEY) ?? "{}"))]);
      const healthData = await health.json();
      setTrackingStatus(healthData.status === "active" ? "active" : "unavailable");
      if (tracker.siteId && healthData.status === "active") {
        const response = await fetch(`/api/tracking?siteId=${encodeURIComponent(tracker.siteId)}`, { cache: "no-store" });
        if (response.ok) { const data = await response.json(); setTracking(data.totals); setOrders(data.orders ?? []); }
      }
    } catch { setTrackingStatus("unavailable"); }
  };

  useEffect(() => { refreshTracking(); const id = window.setInterval(refreshTracking, 30000); return () => window.clearInterval(id); }, []);

  const calc = useMemo(() => {
    const manualRevenue = sales.reduce((sum, sale) => sum + sale.value, 0);
    const webhookRevenue = tracking?.revenue ?? 0;
    const refunds = tracking?.refunds ?? 0;
    const revenue = manualRevenue + webhookRevenue - refunds;
    const spend = Number(adSpend.replace(",", ".")) || 0;
    const cost = Number(productCost.replace(",", ".")) || 0;
    const target = Number(goal.replace(",", ".")) || 0;
    const profit = revenue - spend - cost;
    return { revenue, manualRevenue, webhookRevenue, refunds, spend, cost, target, profit, remaining: Math.max(0, target - revenue), roas: spend > 0 ? revenue / spend : 0, salesNeeded: Number(saleValue) > 0 ? Math.ceil(Math.max(0, target - revenue) / Number(saleValue)) : 0 };
  }, [goal, adSpend, productCost, sales, saleValue, tracking]);

  const alerts = useMemo(() => {
    const result: Array<{ title: string; detail: string; level: "ok" | "warning" }> = [];
    if (tracking && tracking.visits > 20 && tracking.leads === 0) result.push({ title: "Visitas sem lead", detail: "Revise o CTA, formulário e carregamento da página.", level: "warning" });
    if (tracking && tracking.checkouts > 0 && tracking.purchases === 0) result.push({ title: "Checkout sem compra", detail: "Teste o checkout, preço, meios de pagamento e confirmação.", level: "warning" });
    if (calc.spend > 0 && calc.revenue === 0) result.push({ title: "Gasto sem faturamento registrado", detail: "Importe vendas ou reveja a atribuição do funil.", level: "warning" });
    if (!result.length) result.push({ title: "Operação sem alerta crítico", detail: "Continue registrando gastos e vendas para melhorar as decisões.", level: "ok" });
    return result;
  }, [tracking, calc]);

  const addSale = () => { const value = Number(saleValue.replace(",", ".")); if (value > 0) setSales((items) => [{ id: crypto.randomUUID(), value, createdAt: new Date().toISOString() }, ...items]); };
  const addCreative = () => {
    if (!creative.name.trim()) return;
    setCreatives((items) => [{ id: crypto.randomUUID(), name: creative.name, angle: creative.angle, hook: creative.hook, ctr: Number(creative.ctr) || 0, cpa: Number(creative.cpa) || 0, status: "testar" }, ...items]);
    setCreative({ name: "", angle: "", hook: "", ctr: "", cpa: "" });
  };
  const report = `Trackfy - ${today()}\nFaturamento: ${money(calc.revenue)}\nGasto em ads: ${money(calc.spend)}\nLucro: ${money(calc.profit)}\nROAS: ${calc.roas.toFixed(2)}x\nVisitas: ${tracking?.visits ?? 0}\nLeads: ${tracking?.leads ?? 0}\nCheckout: ${tracking?.checkouts ?? 0}\nCompras: ${tracking?.purchases ?? 0}`;
  const webhookExample = useMemo(() => {
    const tracker = typeof window === "undefined" ? {} : JSON.parse(localStorage.getItem(TRACKER_KEY) ?? "{}");
    return JSON.stringify({ siteId: tracker.siteId || "SEU_SITE_ID", transactionId: "pedido-123", status: "paid", value: 97, currency: "BRL", product: "Seu produto", source: "facebook", medium: "cpc", campaign: "nome-da-campanha" }, null, 2);
  }, []);
  const exportBackup = () => {
    const rows = ["tipo,id,status,valor,origem,campanha,data", ...orders.map((order) => ["webhook", order.transactionId, order.status, order.value, order.source, order.campaign, order.updatedAt].map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")), ...sales.map((sale) => ["manual", sale.id, "paid", sale.value, "manual", "", sale.createdAt].join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `trackfy-backup-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="max-w-[1300px] mx-auto space-y-5">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3"><div><h1 className="text-[20px] font-bold" style={{ color: "var(--text-1)" }}>Centro de Operação</h1><p className="text-[13px] mt-1" style={{ color: "var(--text-4)" }}>O que vender, quanto falta e onde agir hoje.</p></div><div className="flex gap-2"><button onClick={exportBackup} className="btn-secondary px-3 py-2"><Download className="w-4 h-4" />Backup CSV</button><button onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="btn-secondary px-4 py-2"><Copy className="w-4 h-4" />{copied ? "Relatório copiado" : "Copiar relatório diário"}</button></div></div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">{[{ label: "Meta do dia", value: money(calc.target), icon: Target }, { label: "Faturado", value: money(calc.revenue), icon: DollarSign }, { label: "Falta", value: money(calc.remaining), icon: TrendingUp }, { label: "ROAS", value: calc.spend ? `${calc.roas.toFixed(2)}x` : "-", icon: Activity }].map((card) => <div key={card.label} className="card p-4"><div className="flex items-center gap-2"><card.icon className="w-4 h-4" style={{ color: "var(--blue)" }} /><p className="text-[12px] font-semibold" style={{ color: "var(--text-4)" }}>{card.label}</p></div><p className="text-[23px] font-bold mt-3" style={{ color: "var(--text-1)" }}>{card.value}</p></div>)}</div>

    <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-5"><div className="card p-5 space-y-3"><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Caixa do dia</h2>{[{ value: goal, set: setGoal, label: "Meta de faturamento" }, { value: adSpend, set: setAdSpend, label: "Gasto em anúncios" }, { value: productCost, set: setProductCost, label: "Custos e taxas" }, { value: saleValue, set: setSaleValue, label: "Valor da próxima venda" }].map((input) => <div key={input.label}><label className="section-label mb-1 block" style={{ padding: 0 }}>{input.label}</label><input value={input.value} onChange={(e) => input.set(e.target.value)} inputMode="decimal" className="input" /></div>)}<button onClick={addSale} className="btn-primary w-full py-2.5"><Plus className="w-4 h-4" />Registrar venda de {money(Number(saleValue) || 0)}</button><p className="text-[12px]" style={{ color: "var(--text-4)" }}>{calc.salesNeeded} venda(s) desse valor para alcançar a meta.</p></div>
      <div className="space-y-4"><div className="card p-5"><div className="flex items-center justify-between"><div><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Funil e banco</h2><p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Atualização automática a cada 30 segundos.</p></div><button onClick={refreshTracking} className="btn-icon w-9 h-9" title="Atualizar"><Database className="w-4 h-4" /></button></div><div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">{[{ label: "Banco", value: trackingStatus === "active" ? "Ativo" : trackingStatus === "loading" ? "..." : "Indisponível" }, { label: "Visitas", value: tracking?.visits ?? 0 }, { label: "Leads", value: tracking?.leads ?? 0 }, { label: "Checkout", value: tracking?.checkouts ?? 0 }, { label: "Vendas reais", value: tracking?.paidOrders ?? 0 }].map((item) => <div key={item.label} className="rounded-lg p-3" style={{ background: "var(--bg-subtle)" }}><p className="text-[11px]" style={{ color: "var(--text-4)" }}>{item.label}</p><p className="text-[18px] font-bold mt-1" style={{ color: item.label === "Banco" && item.value === "Indisponível" ? "var(--red)" : "var(--text-1)" }}>{item.value}</p></div>)}</div></div>
        <div className="card p-5"><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Alertas para agir</h2><div className="space-y-2 mt-3">{alerts.map((alert) => <div key={alert.title} className="flex gap-3 p-3 rounded-lg" style={{ background: alert.level === "warning" ? "var(--yellow-light)" : "var(--green-light)" }}>{alert.level === "warning" ? <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "var(--yellow)" }} /> : <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--green)" }} />}<div><p className="text-[13px] font-bold" style={{ color: "var(--text-2)" }}>{alert.title}</p><p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>{alert.detail}</p></div></div>)}</div></div></div></div>

    <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-5"><div className="card p-5 space-y-3"><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Biblioteca de criativos</h2>{[{ key: "name", label: "Nome" }, { key: "angle", label: "Ângulo" }, { key: "hook", label: "Hook" }, { key: "ctr", label: "CTR (%)" }, { key: "cpa", label: "CPA (R$)" }].map((item) => <div key={item.key}><label className="section-label mb-1 block" style={{ padding: 0 }}>{item.label}</label><input value={creative[item.key as keyof typeof creative]} onChange={(e) => setCreative((data) => ({ ...data, [item.key]: e.target.value }))} className="input" /></div>)}<button onClick={addCreative} className="btn-secondary w-full py-2"><Plus className="w-4 h-4" />Salvar aprendizado</button></div><div className="card overflow-hidden"><div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Criativos salvos</h2></div>{creatives.length === 0 ? <p className="p-8 text-[13px]" style={{ color: "var(--text-4)" }}>Salve os hooks e ângulos que você testou para não perder o aprendizado.</p> : <div className="divide-y" style={{ borderColor: "var(--border)" }}>{creatives.map((item) => <div key={item.id} className="p-4 flex items-start justify-between gap-3"><div><p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{item.name}</p><p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>{item.angle} · {item.hook}</p><p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>CTR {item.ctr}% · CPA {money(item.cpa)}</p></div><select value={item.status} onChange={(e) => setCreatives((list) => list.map((current) => current.id === item.id ? { ...current, status: e.target.value as CreativeNote["status"] } : current))} className="select text-[12px]"><option value="testar">Testar</option><option value="vencedor">Vencedor</option><option value="pausado">Pausado</option></select></div>)}</div>}</div></div>
    <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-5"><div className="card p-5 space-y-3"><div className="flex items-center gap-2"><Webhook className="w-4 h-4" style={{ color: "var(--blue)" }} /><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Webhook de vendas reais</h2></div><p className="text-[12px] leading-relaxed" style={{ color: "var(--text-4)" }}>Configure seu checkout para enviar uma requisição POST para <code>https://tf.digirocket.site/api/webhooks/sales</code> após pagamento ou reembolso confirmado.</p><pre className="rounded-lg p-3 overflow-auto text-[11px]" style={{ background: "#0f172a", color: "#dbeafe" }}><code>{webhookExample}</code></pre><button onClick={() => copyText(webhookExample)} className="btn-secondary px-3 py-2"><Copy className="w-4 h-4" />Copiar JSON</button><p className="text-[11px]" style={{ color: "var(--text-4)" }}>Envie o header <code>Authorization: Bearer SEU_SECRET</code>. Use <code>paid</code> ou <code>refunded</code>; o mesmo transactionId é atualizado, sem duplicar venda.</p></div><div className="card overflow-hidden"><div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Pedidos recebidos por webhook</h2></div>{orders.length === 0 ? <p className="p-8 text-[13px]" style={{ color: "var(--text-4)" }}>Nenhuma venda real recebida ainda. Você pode continuar registrando vendas manualmente acima.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead style={{ background: "var(--bg-subtle)" }}><tr>{["Pedido", "Status", "Valor", "Origem", "Campanha"].map((name) => <th key={name} className="px-4 py-3 text-[11px] uppercase" style={{ color: "var(--text-4)" }}>{name}</th>)}</tr></thead><tbody>{orders.slice(0, 20).map((order) => <tr key={order.transactionId} className="border-t" style={{ borderColor: "var(--border)" }}><td className="px-4 py-3 text-[12px] font-mono" style={{ color: "var(--text-2)" }}>{order.transactionId}</td><td className="px-4 py-3 text-[12px]" style={{ color: order.status === "paid" ? "var(--green)" : "var(--red)" }}>{order.status}</td><td className="px-4 py-3 text-[12px] font-bold" style={{ color: "var(--text-2)" }}>{money(order.value)}</td><td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-3)" }}>{order.source}</td><td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-3)" }}>{order.campaign}</td></tr>)}</tbody></table></div>}</div></div>
  </div>;
}
