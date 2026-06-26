"use client";
import { useState, useEffect, useMemo } from "react";
import { Activity, AlertTriangle, BarChart3, Check, Code2, Copy, Database, ExternalLink, Link2, MousePointerClick, Plus, RefreshCw, Search, Tag, Trash2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { sourceLabel, type TrafficChannel } from "@/lib/tracking";

interface UTMEntry {
  id: string;
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  full: string;
  createdAt: string;
  clicks?: number;
  siteId?: string;
}

const STORAGE_KEY = "tf_utms";
const TRACKER_KEY = "tf_native_tracker";
const TRACKING_SITES_KEY = "tf_tracking_sites";

type TrackingSite = {
  id: string;
  name: string;
  websiteUrl: string;
  measurementId: string;
  metaPixelId: string;
  siteId: string;
  endpoint: string;
  installed: boolean;
};

function loadUTMs(): UTMEntry[] {
  if (typeof window === "undefined") return [];
  try { return dedupeUTMs(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")); } catch { return []; }
}
function saveUTMs(utms: UTMEntry[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupeUTMs(utms))); }

function dedupeUTMs(utms: UTMEntry[]) {
  const seen = new Set<string>();
  return utms.filter((utm) => {
    const key = `${utm.siteId || "legacy"}|${utm.full || utm.url}|${utm.source}|${utm.medium}|${utm.campaign}|${utm.term || ""}|${utm.content || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildURL(base: string, params: Record<string, string>): string {
  try {
    const url = new URL(base.startsWith("http") ? base : `https://${base}`);
    Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
    return url.toString();
  } catch { return ""; }
}

const SOURCE_PRESETS = ["facebook", "instagram", "google", "tiktok", "email", "whatsapp", "youtube", "organic"];
const MEDIUM_PRESETS = ["cpc", "social", "email", "video", "banner", "referral", "organic"];

function buildTrackingSnippet(measurementId: string) {
  const id = measurementId.trim();
  if (!/^G-[A-Z0-9]+$/i.test(id)) return "";
  return `<!-- Trackfy: cole antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${id}', { send_page_view: true });

  (function () {
    var params = new URLSearchParams(window.location.search);
    var attribution = {
      source: params.get('utm_source') || document.referrer || 'direct',
      medium: params.get('utm_medium') || (document.referrer ? 'referral' : 'direct'),
      campaign: params.get('utm_campaign') || '(not set)',
      term: params.get('utm_term') || '',
      content: params.get('utm_content') || ''
    };
    localStorage.setItem('trackfy_attribution', JSON.stringify(attribution));
    gtag('event', 'trackfy_landing', attribution);

    window.trackfyFunnelEvent = function (eventName, extra) {
      var stored = JSON.parse(localStorage.getItem('trackfy_attribution') || '{}');
      gtag('event', eventName, Object.assign({
        source: stored.source || 'direct',
        medium: stored.medium || 'direct',
        campaign: stored.campaign || '(not set)',
        page_path: window.location.pathname
      }, extra || {}));
    };

    // Chame somente depois de confirmação real de pagamento/webhook.
    window.trackfyPurchase = function (order) {
      if (!order || !order.transaction_id) return;
      window.trackfyFunnelEvent('purchase', {
        transaction_id: order.transaction_id,
        value: Number(order.value || 0),
        currency: order.currency || 'BRL',
        items: order.items || []
      });
    };

    document.addEventListener('click', function (event) {
      var target = event.target.closest('a, button, [data-trackfy-click]');
      if (!target) return;
      var stored = JSON.parse(localStorage.getItem('trackfy_attribution') || '{}');
      var funnelEvent = target.getAttribute('data-trackfy-funnel') || 'trackfy_click';
      gtag('event', funnelEvent, {
        source: stored.source || 'direct',
        medium: stored.medium || 'direct',
        campaign: stored.campaign || '(not set)',
        link_url: target.href || '',
        link_text: (target.innerText || target.getAttribute('aria-label') || 'click').trim().slice(0, 100),
        page_path: window.location.pathname
      });
    }, true);
  })();
</script>`;
}

function buildNativeTrackingSnippet(endpoint: string, siteId: string, measurementId: string, metaPixelId: string) {
  if (!endpoint || !siteId) return "";
  const url = new URL(`${endpoint.replace(/\/$/, "")}/api/tracking/script`);
  url.searchParams.set("siteId", siteId);
  if (/^\d{8,20}$/.test(metaPixelId.trim())) url.searchParams.set("pixel", metaPixelId.trim());
  if (/^G-[A-Z0-9]+$/i.test(measurementId.trim())) url.searchParams.set("ga", measurementId.trim());
  return `<!-- Trackfy: cole uma vez antes de </head> -->\n<script defer src="${url.toString()}"></script>`;
}

type TrackingSummary = {
  updatedAt: string;
  range?: { days: number; since: string };
  totals: { visits: number; visitors?: number; pageViews?: number; leads: number; checkouts: number; payments?: number; paymentSelections?: number; orderBumps?: number; postPurchaseClicks?: number; purchases: number; paidOrders?: number; refundedOrders?: number; revenue?: number; refunds?: number; events?: number; attributedSessions?: number; attributedVisitors?: number; savedLeads?: number; savedBuyers?: number };
  channels: Array<{ channel: TrafficChannel; visits: number; leads: number; checkouts: number; purchases: number; paidOrders?: number; revenue?: number; netRevenue?: number; conversionRate?: number }>;
  pages: Array<{ path: string; url: string | null; visits: number; leads: number; checkouts: number; purchases: number; lastSeen: string }>;
  campaigns: Array<{ source: string; medium: string; campaign: string; visits: number; leads?: number; checkouts?: number; purchases?: number; lastSeen: string; paidOrders?: number; revenue?: number; netRevenue?: number; conversionRate?: number }>;
  recentEvents: Array<{ event: string; page: string; source: string; campaign: string; content?: string; value?: number; createdAt: string }>;
  contacts?: Array<{ name: string | null; email: string | null; phone: string | null; source: string; medium: string; campaign: string; firstPage: string | null; lastPage: string | null; firstSeenAt: string; lastSeenAt: string; leadAt: string | null; purchaseAt: string | null; ordersCount: number; totalValue: number; currency: string }>;
  eventCounts: Record<string, number>;
};

type UTMTab = "create" | "list" | "tracking" | "data" | "checkout" | "contacts" | "debug";

export default function UTMsPage({ initialTab = "create" }: { initialTab?: UTMTab } = {}) {
  const [utms, setUTMs]   = useState<UTMEntry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm]   = useState({ url: "", source: "", medium: "", campaign: "", term: "", content: "" });
  const [activeTab, setActiveTab] = useState<UTMTab>(initialTab);
  const [tracker, setTracker] = useState<TrackingSite>({ id: "", name: "", websiteUrl: "", measurementId: "", metaPixelId: "", siteId: "", endpoint: "", installed: false });
  const [sites, setSites] = useState<TrackingSite[]>([]);
  const [sitesReady, setSitesReady] = useState(false);
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [utmsSyncing, setUtmsSyncing] = useState(false);
  const [rangeDays, setRangeDays] = useState(7);
  const [resetText, setResetText] = useState("");
  const [resettingMetrics, setResettingMetrics] = useState(false);

  useEffect(() => {
    setUTMs(loadUTMs());
    const fallbackEndpoint = window.location.origin;
    try {
      const savedSites = JSON.parse(localStorage.getItem(TRACKING_SITES_KEY) ?? "[]") as TrackingSite[];
      const active = JSON.parse(localStorage.getItem(TRACKER_KEY) ?? "{}");
      const legacySite: TrackingSite = { id: crypto.randomUUID(), name: active.name || "Oferta principal", websiteUrl: "", measurementId: "", metaPixelId: "", siteId: crypto.randomUUID(), endpoint: fallbackEndpoint, installed: false, ...active };
      const nextSites = savedSites.length ? savedSites : [legacySite];
      const selected = nextSites.find((site) => site.id === active.id) ?? nextSites[0];
      setSites(nextSites); setTracker(selected); setSitesReady(true);
    } catch {
      const first: TrackingSite = { id: crypto.randomUUID(), name: "Oferta principal", websiteUrl: "", measurementId: "", metaPixelId: "", siteId: crypto.randomUUID(), endpoint: fallbackEndpoint, installed: false };
      setSites([first]); setTracker(first); setSitesReady(true);
    }
  }, []);

  useEffect(() => {
    if (!tracker.siteId) return;
    let cancelled = false;
    const syncUTMs = async () => {
      setUtmsSyncing(true);
      try {
        const response = await fetch(`/api/utms?siteId=${encodeURIComponent(tracker.siteId)}`, { cache: "no-store" });
        const result = await response.json();
        if (cancelled) return;
        const remote = Array.isArray(result.utms) ? dedupeUTMs(result.utms as UTMEntry[]) : [];
        if (remote.length) { setUTMs(remote); saveUTMs(remote); return; }
        const local = loadUTMs().filter((item) => !item.siteId || item.siteId === tracker.siteId);
        setUTMs(dedupeUTMs(local));
        await Promise.all(local.map((item) => fetch("/api/utms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...item, siteId: tracker.siteId }) })));
      } catch { if (!cancelled) setUTMs(loadUTMs().filter((item) => !item.siteId || item.siteId === tracker.siteId)); }
      finally { if (!cancelled) setUtmsSyncing(false); }
    };
    syncUTMs();
    return () => { cancelled = true; };
  }, [tracker.siteId]);
  useEffect(() => {
    if (!sitesReady || !tracker.siteId) return;
    localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
    setSites((current) => {
      const next = current.map((site) => site.id === tracker.id ? tracker : site);
      localStorage.setItem(TRACKING_SITES_KEY, JSON.stringify(next));
      return next;
    });
  }, [tracker, sitesReady]);

  const selectSite = (id: string) => {
    const site = sites.find((item) => item.id === id);
    if (site) { setTracker(site); setSummary(null); setSummaryError(""); }
  };
  const createSite = () => {
    const site: TrackingSite = { id: crypto.randomUUID(), name: `Nova oferta ${sites.length + 1}`, websiteUrl: "", measurementId: "", metaPixelId: "", siteId: crypto.randomUUID(), endpoint: window.location.origin, installed: false };
    setSites((items) => [...items, site]); setTracker(site); setActiveTab("tracking"); setSummary(null);
  };

  const preview = buildURL(form.url, {
    utm_source: form.source, utm_medium: form.medium, utm_campaign: form.campaign,
    utm_term: form.term, utm_content: form.content,
  });
  const trackingSnippet = useMemo(() => buildTrackingSnippet(tracker.measurementId), [tracker.measurementId]);
  const nativeTrackingSnippet = useMemo(() => buildNativeTrackingSnippet(tracker.endpoint, tracker.siteId, tracker.measurementId, tracker.metaPixelId), [tracker.endpoint, tracker.siteId, tracker.measurementId, tracker.metaPixelId]);

  const loadSummary = async () => {
    if (!tracker.siteId) return;
    setSummaryLoading(true); setSummaryError("");
    try {
      const response = await fetch(`/api/tracking?siteId=${encodeURIComponent(tracker.siteId)}&days=${rangeDays}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar os dados.");
      setSummary(result);
    } catch (error) { setSummaryError(error instanceof Error ? error.message : "Não foi possível carregar os dados."); }
    finally { setSummaryLoading(false); }
  };

  useEffect(() => {
    if (!["data", "checkout", "contacts", "debug"].includes(activeTab) || !tracker.siteId) return;
    loadSummary();
    const timer = window.setInterval(loadSummary, 5000);
    return () => window.clearInterval(timer);
  // Atualiza o painel enquanto a aba está aberta, sem exigir GA4.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tracker.siteId, rangeDays]);

  const handleSave = async () => {
    if (!form.url || !form.source || !form.medium || !form.campaign) return;
    const duplicate = utms.find((utm) => utm.siteId === tracker.siteId && utm.full === preview);
    if (duplicate) {
      setActiveTab("list");
      setCopied(duplicate.id);
      setTimeout(() => setCopied(null), 2000);
      return;
    }
    const entry: UTMEntry = {
      id: crypto.randomUUID(), ...form, full: preview,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      clicks: 0, siteId: tracker.siteId,
    };
    const updated = dedupeUTMs([entry, ...utms]);
    setUTMs(updated); saveUTMs(updated);
    try { await fetch("/api/utms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) }); } catch { /* cópia local permanece disponível */ }
    setForm({ url: "", source: "", medium: "", campaign: "", term: "", content: "" });
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const updated = utms.filter((u) => u.id !== id);
    setUTMs(updated); saveUTMs(updated);
    try { await fetch(`/api/utms?id=${encodeURIComponent(id)}&siteId=${encodeURIComponent(tracker.siteId)}`, { method: "DELETE" }); } catch { /* cópia local permanece disponível */ }
  };

  const handleResetMetrics = async () => {
    if (!tracker.siteId || resetText.trim().toUpperCase() !== "RESETAR") return;
    setResettingMetrics(true); setSummaryError("");
    try {
      const response = await fetch(`/api/tracking?siteId=${encodeURIComponent(tracker.siteId)}&confirm=${encodeURIComponent(tracker.siteId)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível resetar as métricas.");
      setSummary(null);
      setResetText("");
      await loadSummary();
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "Não foi possível resetar as métricas.");
    } finally {
      setResettingMetrics(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = utms.filter((u) =>
    u.campaign.toLowerCase().includes(search.toLowerCase()) ||
    u.source.toLowerCase().includes(search.toLowerCase())
  );

  const isFormValid = form.url && form.source && form.medium && form.campaign;
  const funnelSteps = summary ? [
    { key: "page_view", label: "Sessões", value: summary.totals.visits, color: "var(--blue)" },
    { key: "generate_lead", label: "Leads", value: summary.totals.leads, color: "var(--green)" },
    { key: "begin_checkout", label: "Checkout", value: summary.totals.checkouts, color: "var(--yellow)" },
    { key: "add_payment_info", label: "Pagamento", value: summary.totals.payments ?? 0, color: "#f97316" },
    { key: "purchase", label: "Compras", value: summary.totals.purchases, color: "var(--purple, #7c3aed)" },
  ] : [];
  const funnelRates = summary ? {
    visitToLead: summary.totals.visits > 0 ? (summary.totals.leads / summary.totals.visits) * 100 : 0,
    visitToCheckout: summary.totals.visits > 0 ? (summary.totals.checkouts / summary.totals.visits) * 100 : 0,
    checkoutToPurchase: summary.totals.checkouts > 0 ? (summary.totals.purchases / summary.totals.checkouts) * 100 : 0,
    visitToPurchase: summary.totals.visits > 0 ? (summary.totals.purchases / summary.totals.visits) * 100 : 0,
  } : { visitToLead: 0, visitToCheckout: 0, checkoutToPurchase: 0, visitToPurchase: 0 };
  const pageViewCount = summary?.totals.pageViews ?? summary?.eventCounts?.page_view ?? 0;
  const visitorCount = summary?.totals.visitors ?? summary?.totals.visits ?? 0;
  const attributedSessions = summary?.totals.attributedSessions ?? 0;
  const attributedVisitors = summary?.totals.attributedVisitors ?? attributedSessions;
  const attributionRate = visitorCount > 0 ? (attributedVisitors / visitorCount) * 100 : 0;
  const revenue = summary?.totals.revenue ?? 0;
  const refunds = summary?.totals.refunds ?? 0;
  const netRevenue = Math.max(0, revenue - refunds);
  const paidOrders = summary?.totals.paidOrders ?? 0;
  const savedLeads = summary?.totals.savedLeads ?? 0;
  const savedBuyers = summary?.totals.savedBuyers ?? 0;
  const savedContacts = summary?.contacts ?? [];
  const averageOrder = paidOrders > 0 ? revenue / paidOrders : 0;
  const revenuePerSession = summary && summary.totals.visits > 0 ? revenue / summary.totals.visits : 0;
  const paymentCount = summary?.totals.payments ?? summary?.eventCounts?.add_payment_info ?? 0;
  const paymentSelections = summary?.totals.paymentSelections ?? summary?.eventCounts?.payment_selected ?? 0;
  const orderBumpCount = summary?.totals.orderBumps ?? summary?.eventCounts?.order_bump_add ?? 0;
  const postPurchaseCount = summary?.totals.postPurchaseClicks ?? ((summary?.eventCounts?.post_purchase_offer_click ?? 0) + (summary?.eventCounts?.upsell_click ?? 0));
  const checkoutGap = summary ? Math.max(0, summary.totals.checkouts - summary.totals.purchases) : 0;
  const purchaseWithoutValue = summary ? summary.totals.purchases > 0 && revenue <= 0 : false;
  const sessionWord = (count: number) => count === 1 ? "sessão" : "sessões";
  const reachedText = (count: number) => count === 1 ? "chegou" : "chegaram";
  const openedText = (count: number) => count === 1 ? "abriu" : "abriram";
  const maxChannelVisits = summary ? Math.max(1, ...summary.channels.map((channel) => channel.visits)) : 1;
  const topCampaigns = summary?.campaigns.slice(0, 6) ?? [];
  const maxCampaignVisits = Math.max(1, ...topCampaigns.map((campaign) => campaign.visits));
  const precisionChecks = summary ? [
    { label: "Direto não vira pago", ok: summary.campaigns.every((campaign) => !(campaign.source === "direct" && /cpc|paid|banner|facebook|google/i.test(`${campaign.medium} ${campaign.campaign}`))), detail: "Sessões sem UTM ficam em Direto." },
    { label: "Pageview coerente", ok: pageViewCount >= summary.totals.visits, detail: `${pageViewCount} pageviews para ${summary.totals.visits} sessões.` },
    { label: "Compra deduplicada", ok: summary.totals.purchases <= Math.max(summary.totals.checkouts, summary.totals.purchases), detail: "Compra usa ID do pedido quando enviado." },
  ] : [];
  const tabMeta: Record<UTMTab, { eyebrow: string; title: string; description: string }> = {
    create: { eyebrow: "Criação", title: "Monte links limpos para cada anúncio", description: "Padronize source, medium, campanha, criativo e palavra-chave sem bagunçar as métricas." },
    list: { eyebrow: "Biblioteca", title: "UTMs salvas por oferta", description: "Copie links prontos, busque campanhas e mantenha cada site separado." },
    tracking: { eyebrow: "Instalação", title: "Script único do Trackfy", description: "Cole uma vez no site e acompanhe visitas, funil, vendas e origem aqui dentro." },
    data: { eyebrow: "Dashboard", title: "Resultado real do site", description: "Veja sessões, checkout, compras e receita sem depender só das plataformas de anúncio." },
    checkout: { eyebrow: "Eventos", title: "Checkout, bumps e pós-venda", description: "Marque Pix, bump, compra aprovada e upsell para saber onde o dinheiro trava." },
    contacts: { eyebrow: "Leads", title: "Leads e compradores salvos", description: "Centralize contatos enviados por formulário, checkout e compra aprovada." },
    debug: { eyebrow: "Auditoria", title: "Precisão e reset do tracking", description: "Confira eventos recebidos, páginas rastreadas e limpe métricas de teste." },
  };
  const activeMeta = tabMeta[activeTab];
  const setupItems = [
    { label: "Oferta", ok: Boolean(tracker.name && tracker.siteId), detail: tracker.name || "Sem nome" },
    { label: "Domínio", ok: Boolean(tracker.websiteUrl), detail: tracker.websiteUrl || "Cadastre na aba Instalar" },
    { label: "Script", ok: Boolean(nativeTrackingSnippet), detail: nativeTrackingSnippet ? "Pronto para copiar" : "Gerando código" },
    { label: "Meta Pixel", ok: Boolean(tracker.metaPixelId), detail: tracker.metaPixelId || "Opcional" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}>
        <div className="p-5 lg:p-6" style={{ background: "linear-gradient(135deg, #0f172a 0%, #172554 46%, #064e3b 100%)" }}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "#bfdbfe" }}>{activeMeta.eyebrow}</p>
              <h1 className="text-[24px] lg:text-[28px] font-bold mt-2 text-white">Central de UTMs & Rastreamento</h1>
              <p className="text-[14px] mt-2 leading-relaxed text-slate-200">{activeMeta.title}. {activeMeta.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button type="button" onClick={() => setActiveTab("create")} className="px-3 py-2 rounded-lg text-[12px] font-bold text-white" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <Plus className="w-3.5 h-3.5 inline mr-1" strokeWidth={2.5} /> Nova UTM
                </button>
                <button type="button" onClick={() => setActiveTab("data")} className="px-3 py-2 rounded-lg text-[12px] font-bold text-white" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <BarChart3 className="w-3.5 h-3.5 inline mr-1" strokeWidth={2.5} /> Ver métricas
                </button>
                <button type="button" onClick={() => setActiveTab("checkout")} className="px-3 py-2 rounded-lg text-[12px] font-bold text-white" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <MousePointerClick className="w-3.5 h-3.5 inline mr-1" strokeWidth={2.5} /> Eventos do funil
                </button>
              </div>
            </div>
            <div className="w-full lg:w-[360px] rounded-xl p-4" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(10px)" }}>
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-300">Oferta ativa</label>
              <select value={tracker.id} onChange={(e) => selectSite(e.target.value)} className="select mt-2" style={{ background: "rgba(255,255,255,0.95)" }}>
                {sites.map((site) => <option key={site.id} value={site.id}>{site.name || "Oferta sem nome"}{site.websiteUrl ? ` — ${site.websiteUrl}` : ""}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button type="button" onClick={() => setActiveTab("tracking")} className="px-3 py-2 rounded-lg text-[12px] font-bold text-white" style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.14)" }}>Configurar</button>
                <button type="button" onClick={createSite} className="px-3 py-2 rounded-lg text-[12px] font-bold text-white" style={{ background: "rgba(16,185,129,0.24)", border: "1px solid rgba(16,185,129,0.32)" }}>Nova oferta</button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0" style={{ borderColor: "var(--border)" }}>
          {setupItems.map((item) => (
            <div key={item.label} className="p-4 min-h-[96px]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase" style={{ color: "var(--text-4)" }}>{item.label}</p>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.ok ? "var(--green)" : "var(--yellow)" }} />
              </div>
              <p className="text-[13px] font-bold mt-2 truncate" style={{ color: "var(--text-1)" }}>{item.detail}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>{item.ok ? "Configurado" : "Pendente"}</p>
            </div>
          ))}
        </div>
      </div>

      {["create", "list", "tracking"].includes(activeTab) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { step: "1", title: "Instale o Trackfy", text: "Cole um único script no seu site. GA4 é opcional, não é onde você precisa trabalhar." },
            { step: "2", title: "Crie a UTM", text: "Nesta página, gere uma URL para cada campanha e criativo." },
            { step: "3", title: "Cole no anúncio", text: "Use a URL final com UTM no Meta, TikTok, e-mail ou WhatsApp." },
            { step: "4", title: "Veja os dados", text: "Abra Dashboard para ver visitas, leads, checkout e compras por origem." },
          ].map((item) => (
            <div key={item.step} className="card p-4 flex gap-3">
              <span className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[12px] font-bold" style={{ background: "var(--blue-muted)", color: "var(--blue)" }}>{item.step}</span>
              <div>
                <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{item.title}</p>
                <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-4)" }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-full overflow-x-auto" style={{ background: "var(--bg-muted)" }}>
        {[
          { id: "create", label: "Criar" },
          { id: "list", label: `Biblioteca (${utms.length})` },
          { id: "tracking", label: "Instalar" },
          { id: "data", label: "Dashboard" },
          { id: "checkout", label: "Checkout" },
          { id: "contacts", label: "Leads" },
          { id: "debug", label: "Debug" },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 whitespace-nowrap"
            style={{
              background: activeTab === t.id ? "var(--surface)" : "transparent",
              color: activeTab === t.id ? "var(--text-1)" : "var(--text-4)",
              boxShadow: activeTab === t.id ? "var(--shadow-sm)" : "none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Form */}
          <div className="lg:col-span-3 card p-6 space-y-5">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--text-1)" }}>Parâmetros UTM</h2>

            {/* URL */}
            <div>
              <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                URL de Destino *
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-4)" }} strokeWidth={2} />
                <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://seusite.com/pagina"
                  className="input pl-9" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Source */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Source *
                </label>
                <input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  placeholder="facebook, google..." className="input mb-2" />
                <div className="flex flex-wrap gap-1">
                  {SOURCE_PRESETS.map((p) => (
                    <button key={p} onClick={() => setForm((f) => ({ ...f, source: p }))}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all duration-100"
                      style={{
                        background: form.source === p ? "var(--blue-muted)" : "var(--bg-muted)",
                        color: form.source === p ? "var(--blue)" : "var(--text-4)",
                        border: `1px solid ${form.source === p ? "rgba(37,99,235,0.3)" : "var(--border)"}`,
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medium */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Medium *
                </label>
                <input value={form.medium} onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))}
                  placeholder="cpc, social..." className="input mb-2" />
                <div className="flex flex-wrap gap-1">
                  {MEDIUM_PRESETS.map((p) => (
                    <button key={p} onClick={() => setForm((f) => ({ ...f, medium: p }))}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all duration-100"
                      style={{
                        background: form.medium === p ? "var(--blue-muted)" : "var(--bg-muted)",
                        color: form.medium === p ? "var(--blue)" : "var(--text-4)",
                        border: `1px solid ${form.medium === p ? "rgba(37,99,235,0.3)" : "var(--border)"}`,
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Campaign */}
            <div>
              <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Campaign *
              </label>
              <input value={form.campaign} onChange={(e) => setForm((f) => ({ ...f, campaign: e.target.value }))}
                placeholder="nome-da-campanha" className="input" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Term <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <input value={form.term} onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
                  placeholder="palavra-chave" className="input" />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Content <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <input value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="variacao-criativo" className="input" />
              </div>
            </div>

            <button onClick={handleSave} disabled={!isFormValid}
              className="btn-primary w-full py-2.5 text-[14px]">
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Salvar UTM
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h3 className="text-[13px] font-bold mb-3" style={{ color: "var(--text-1)" }}>Preview da URL</h3>
              {preview ? (
                <>
                  <div className="p-3 rounded-xl font-mono text-[11px] leading-relaxed break-all"
                    style={{ background: "var(--bg-muted)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                    {/* Highlight parts */}
                    {(() => {
                      const [base, query] = preview.split("?");
                      return (
                        <>
                          <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{base}</span>
                          {query && (
                            <>
                              <span style={{ color: "var(--text-4)" }}>?</span>
                              {query.split("&").map((param, i) => {
                                const [k, v] = param.split("=");
                                return (
                                  <span key={i}>
                                    {i > 0 && <span style={{ color: "var(--text-4)" }}>&</span>}
                                    <span style={{ color: "var(--blue)" }}>{k}</span>
                                    <span style={{ color: "var(--text-4)" }}>=</span>
                                    <span style={{ color: "var(--green)" }}>{decodeURIComponent(v ?? "")}</span>
                                  </span>
                                );
                              })}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <button onClick={() => handleCopy(preview, "preview")}
                    className="btn-secondary w-full mt-3 py-2">
                    {copied === "preview"
                      ? <><Check className="w-3.5 h-3.5 text-green-500" strokeWidth={2.5} /> Copiado!</>
                      : <><Copy className="w-3.5 h-3.5" strokeWidth={2} /> Copiar URL</>}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                  <Link2 className="w-8 h-8" style={{ color: "var(--border-2)" }} strokeWidth={1.5} />
                  <p style={{ fontSize: 13, color: "var(--text-4)" }}>Preencha os campos para ver a URL</p>
                </div>
              )}
            </div>

            {/* Params summary */}
            {(form.source || form.medium || form.campaign) && (
              <div className="card p-4 space-y-2">
                <h3 className="text-[12px] font-bold mb-2" style={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Parâmetros</h3>
                {[
                  { key: "utm_source",   value: form.source,   color: "var(--blue)" },
                  { key: "utm_medium",   value: form.medium,   color: "var(--green)" },
                  { key: "utm_campaign", value: form.campaign, color: "#8b5cf6" },
                  { key: "utm_term",     value: form.term,     color: "var(--yellow)" },
                  { key: "utm_content",  value: form.content,  color: "#ec4899" },
                ].filter((p) => p.value).map((p) => (
                  <div key={p.key} className="flex items-center justify-between">
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)", fontFamily: "monospace" }}>{p.key}</span>
                    <span className="badge" style={{ background: `${p.color}15`, color: p.color, fontFamily: "monospace" }}>{p.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-4)" }} strokeWidth={2.5} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por campanha ou source..."
                className="input pl-9" />
            </div>
            <span style={{ fontSize: 13, color: "var(--text-4)" }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-16 text-center">
              <Tag className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--border-2)" }} strokeWidth={1.5} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>
                {utms.length === 0 ? "Nenhum UTM salvo ainda" : "Nenhum resultado encontrado"}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>
                {utms.length === 0 ? "Crie seu primeiro UTM na aba 'Criar UTM'" : "Tente outro termo de busca"}
              </p>
              {utms.length === 0 && (
                <button onClick={() => setActiveTab("create")} className="btn-primary mt-4 px-5 py-2">
                  <Plus className="w-4 h-4" strokeWidth={2.5} /> Criar UTM
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((u) => (
                <div key={u.id} className="card p-4 hover:shadow-md transition-all duration-150">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{u.campaign}</span>
                        <span className="badge badge-blue">{u.source}</span>
                        <span className="badge badge-neutral">{u.medium}</span>
                        {u.term && <span className="badge" style={{ background: "var(--yellow-light)", color: "var(--yellow)" }}>{u.term}</span>}
                        {u.content && <span className="badge" style={{ background: "#fdf4ff", color: "#9333ea" }}>{u.content}</span>}
                      </div>
                      <p className="font-mono text-[11px] truncate" style={{ color: "var(--text-4)" }}>{u.full}</p>
                      <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 4 }}>Criado em {u.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleCopy(u.full, u.id)}
                        className="btn-icon w-8 h-8" title="Copiar URL">
                        {copied === u.id
                          ? <Check className="w-3.5 h-3.5 text-green-500" strokeWidth={2.5} />
                          : <Copy className="w-3.5 h-3.5" strokeWidth={2} />}
                      </button>
                      <a href={u.full} target="_blank" rel="noopener noreferrer"
                        className="btn-icon w-8 h-8" title="Abrir URL">
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                      </a>
                      <button onClick={() => handleDelete(u.id)}
                        className="btn-icon w-8 h-8" title="Excluir"
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-4)")}>
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "tracking" && (
        <div className="space-y-5">
          <div className="rounded-xl border p-5 flex flex-col lg:flex-row lg:items-center gap-4" style={{ borderColor: "rgba(37,99,235,0.2)", background: "var(--blue-light)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--surface)" }}>
              <Activity className="w-5 h-5" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-bold" style={{ color: "var(--text-1)" }}>Rastreie origens e cliques do seu site</h2>
              <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>
                Um único script envia os eventos para o Trackfy. Ele identifica UTMs, origem, visitas orgânicas, referências, acessos diretos e etapas reais do funil.
              </p>
            </div>
            <span className="badge badge-blue">Trackfy nativo</span>
          </div>

          <div className="card p-4 flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Oferta/site em edição</label>
              <select value={tracker.id} onChange={(e) => selectSite(e.target.value)} className="select">
                {sites.map((site) => <option key={site.id} value={site.id}>{site.name || "Oferta sem nome"}{site.websiteUrl ? ` — ${site.websiteUrl}` : ""}</option>)}
              </select>
            </div>
            <button type="button" onClick={createSite} className="btn-secondary px-4 py-2"><Plus className="w-4 h-4" />Nova oferta/site</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[390px_1fr] gap-5">
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Configuração</h2>
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Nome da oferta/site</label>
                <input value={tracker.name} onChange={(e) => setTracker((t) => ({ ...t, name: e.target.value }))} placeholder="Ex.: 10Pila Copa" className="input" />
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>URL do seu site</label>
                <input value={tracker.websiteUrl} onChange={(e) => setTracker((t) => ({ ...t, websiteUrl: e.target.value }))} placeholder="https://seusite.com" className="input" />
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>ID de medição GA4</label>
                <input value={tracker.measurementId} onChange={(e) => setTracker((t) => ({ ...t, measurementId: e.target.value.toUpperCase() }))} placeholder="G-XXXXXXXXXX" className="input font-mono" />
                <p className="text-[12px] mt-1.5" style={{ color: "var(--text-4)" }}>Opcional. Preencha apenas se quiser uma cópia dos dados no Google Analytics. O Trackfy funciona sem entrar no GA4.</p>
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>ID do Pixel da Meta</label>
                <input value={tracker.metaPixelId} onChange={(e) => setTracker((t) => ({ ...t, metaPixelId: e.target.value.replace(/\D/g, "") }))} placeholder="Ex.: 123456789012345" className="input font-mono" inputMode="numeric" />
                <p className="text-[12px] mt-1.5" style={{ color: "var(--text-4)" }}>Opcional. Informe o número que aparece dentro de <code>fbq('init', '...')</code>. Ao copiar o script Trackfy atualizado, não cole também o código-base do Pixel para não duplicar PageView.</p>
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Endereço do Trackfy</label>
                <input value={tracker.endpoint} onChange={(e) => setTracker((t) => ({ ...t, endpoint: e.target.value.replace(/\/$/, "") }))} placeholder="https://tf.digirocket.site" className="input font-mono" />
                <p className="text-[12px] mt-1.5" style={{ color: "var(--text-4)" }}>Deixe o endereço do seu painel Trackfy. Não coloque a URL da sua landing page aqui.</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "var(--bg-muted)" }}>
                <p className="text-[12px] font-bold" style={{ color: "var(--text-2)" }}>O que aparece no Trackfy</p>
                <div className="mt-2 space-y-1.5 text-[12px]" style={{ color: "var(--text-3)" }}>
                  <p>Fonte e campanha UTM, página de entrada e referência</p>
                  <p>Pago, orgânico, referência e direto classificados automaticamente</p>
                  <p>Visitas, leads, checkout e compras deduplicadas por ID do pedido</p>
                  {tracker.metaPixelId && <p>Meta Pixel: PageView, ViewContent, Lead, InitiateCheckout e Purchase</p>}
                </div>
              </div>
              <div className="rounded-lg p-3" style={{ background: "var(--blue-light)" }}>
                <p className="text-[12px] font-bold" style={{ color: "var(--blue)" }}>Separação garantida</p>
                <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>Este site possui um ID Trackfy próprio. Use um Pixel Meta diferente para cada oferta quando quiser relatórios Meta separados. Nunca copie o script desta oferta para outro domínio.</p>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" style={{ color: "var(--green)" }} strokeWidth={2.5} />
                  <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Script único para instalar no site</h2>
                </div>
                <button onClick={() => handleCopy(nativeTrackingSnippet, "tracking-script")} disabled={!nativeTrackingSnippet} className="btn-secondary px-3 py-2">
                  {copied === "tracking-script" ? <Check className="w-4 h-4 text-green-500" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                  {copied === "tracking-script" ? "Copiado" : "Copiar script"}
                </button>
              </div>
              {nativeTrackingSnippet ? (
                <pre className="min-h-[330px] max-h-[510px] overflow-auto rounded-xl p-4 text-[11px] leading-relaxed" style={{ background: "#0f172a", color: "#dbeafe" }}><code>{nativeTrackingSnippet}</code></pre>
              ) : (
                <div className="min-h-[330px] flex flex-col items-center justify-center text-center" style={{ color: "var(--text-4)" }}>
                  <MousePointerClick className="w-10 h-10 mb-3" strokeWidth={1.5} />
                  <p className="text-[13px] font-semibold">Preparando seu identificador de site</p>
                  <p className="text-[12px] mt-1 max-w-sm">O Trackfy gera o código pronto para você colar antes de <code>&lt;/head&gt;</code> no seu site.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { step: "1", title: "Copie e cole", text: "Cole o script uma vez, antes de </head>, em todas as páginas da sua landing page. Com Pixel preenchido, ele já inclui a Meta." },
                { step: "2", title: "Crie UTMs", text: "Use Criar UTM para cada anúncio. Meta, Google, TikTok, e-mail e WhatsApp usam a URL final." },
                { step: "3", title: "Marque o funil", text: "No botão de checkout use data-trackfy-funnel=\"begin_checkout\". Compra só deve sair de um pagamento confirmado." },
                { step: "4", title: "Acompanhe aqui", text: "Abra Dados no Trackfy. GA4 é opcional e serve como uma segunda fonte de conferência." },
              ].map((item) => (
              <div key={item.step} className="card p-4 flex gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ background: "var(--blue-muted)", color: "var(--blue)" }}>{item.step}</span>
                <div><p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{item.title}</p><p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-4)" }}>{item.text}</p></div>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>De onde vem cada número</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg p-4" style={{ background: "var(--bg-subtle)" }}>
                <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Trackfy nativo</p>
                <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>Dados no Trackfy mostra as visitas e o funil enviados pelo seu próprio site. É a sua visão principal de origem, UTM, orgânico, referência e direto.</p>
              </div>
              <div className="rounded-lg p-4" style={{ background: "var(--bg-subtle)" }}>
                <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Plataformas e GA4</p>
                <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>Meta, Google e TikTok trazem gasto, impressões e cliques de anúncio. GA4 é opcional para auditoria. Nenhuma dessas telas substitui os dados de visita do seu site.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {["data", "checkout", "contacts", "debug"].includes(activeTab) && (
        <div className="space-y-5">
          <div className="card p-4 flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Dados da oferta/site</label>
              <select value={tracker.id} onChange={(e) => selectSite(e.target.value)} className="select">
                {sites.map((site) => <option key={site.id} value={site.id}>{site.name || "Oferta sem nome"}{site.websiteUrl ? ` — ${site.websiteUrl}` : ""}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => setActiveTab("tracking")} className="btn-secondary px-4 py-2">Configurar oferta</button>
          </div>
          <div className="card p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--blue-muted)" }}>
              <Database className="w-5 h-5" style={{ color: "var(--blue)" }} strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-bold" style={{ color: "var(--text-1)" }}>Dados do seu site no Trackfy</h2>
              <p className="text-[13px] mt-1" style={{ color: "var(--text-4)" }}>Visitantes, sessões, funil consolidado e páginas separadas por visualização. Atualiza sozinho enquanto esta aba fica aberta.</p>
            </div>
            <select value={rangeDays} onChange={(e) => setRangeDays(Number(e.target.value))} className="select w-full md:w-36">
              <option value={1}>Hoje</option>
              <option value={3}>3 dias</option>
              <option value={7}>7 dias</option>
              <option value={14}>14 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
            </select>
            <button type="button" onClick={loadSummary} disabled={summaryLoading || !tracker.siteId} className="btn-secondary px-3 py-2">
              <RefreshCw className={`w-4 h-4 ${summaryLoading ? "animate-spin" : ""}`} strokeWidth={2.25} />
              {summaryLoading ? "Atualizando" : "Atualizar dados"}
            </button>
            <span className="badge badge-green whitespace-nowrap">Ao vivo 5s</span>
          </div>

          {activeTab === "data" && !summary && !summaryError && (
            <div className="card p-10 text-center">
              <BarChart3 className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--border-2)" }} strokeWidth={1.5} />
              <p className="text-[14px] font-bold" style={{ color: "var(--text-2)" }}>Pronto para receber visitas</p>
              <p className="text-[13px] mt-1 max-w-md mx-auto" style={{ color: "var(--text-4)" }}>Instale o script, abra uma URL UTM no seu site e clique em Atualizar dados. O primeiro acesso passa a aparecer aqui.</p>
            </div>
          )}

          {summaryError && (
            <div className="rounded-lg p-4" style={{ background: "var(--yellow-light)", border: "1px solid rgba(202,138,4,0.18)" }}>
              <p className="text-[13px] font-bold" style={{ color: "var(--text-2)" }}>O coletor ainda não está pronto</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>{summaryError} Configure a chave de serviço do Supabase no backend e execute a migração de eventos uma vez.</p>
            </div>
          )}

          {activeTab === "checkout" && !summary && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3" style={{ borderColor: "var(--border)" }}>
                <div>
                  <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Eventos de checkout prontos para copiar</h2>
                  <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Use depois de instalar o script único da oferta. A compra deve disparar somente quando o pagamento estiver aprovado.</p>
                </div>
                <button type="button" className="btn-secondary px-3 py-2" onClick={() => handleCopy(`<button data-trackfy-bump="vitalicio" data-trackfy-value="49.90">Adicionar acesso vitalicio</button>
<button data-trackfy-payment="pix" data-trackfy-value="67.90">Pagar com Pix</button>
<script>
window.trackfyPurchase({
  transaction_id: "ID_DO_PEDIDO",
  value: 117.80,
  currency: "BRL",
  name: "Nome do cliente",
  email: "cliente@email.com",
  phone: "11999999999"
});
</script>
<button data-trackfy-post-purchase="upsell_vip" data-trackfy-value="97">Quero o upsell VIP</button>`, "checkout-events-empty")}>
                  {copied === "checkout-events-empty" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied === "checkout-events-empty" ? "Copiado" : "Copiar eventos"}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <pre className="p-5 overflow-auto text-[11px] leading-relaxed" style={{ background: "#0f172a", color: "#dbeafe" }}><code>{`<!-- Bump aceito -->
<button data-trackfy-bump="vitalicio" data-trackfy-value="49.90">
  Adicionar acesso vitalicio
</button>

<!-- Pagamento escolhido -->
<button data-trackfy-payment="pix" data-trackfy-value="117.80">
  Pagar com Pix
</button>

<!-- Pos-venda / upsell -->
<button data-trackfy-post-purchase="upsell_vip" data-trackfy-value="97">
  Quero o upsell VIP
</button>`}</code></pre>
                <pre className="p-5 overflow-auto text-[11px] leading-relaxed border-t lg:border-t-0 lg:border-l" style={{ background: "var(--bg-subtle)", color: "var(--text-2)", borderColor: "var(--border)" }}><code>{`// Dispare somente apos pagamento aprovado:
window.trackfyPurchase({
  transaction_id: "ID_DO_PEDIDO",
  value: 117.80,
  currency: "BRL",
  name: "Nome do cliente",
  email: "cliente@email.com",
  phone: "11999999999"
});`}</code></pre>
              </div>
            </div>
          )}

          {(activeTab === "contacts" || activeTab === "debug") && !summary && (
            <div className="card p-8 text-center">
              <Database className="w-9 h-9 mx-auto mb-3" style={{ color: "var(--border-2)" }} strokeWidth={1.5} />
              <p className="text-[14px] font-bold" style={{ color: "var(--text-2)" }}>{activeTab === "contacts" ? "Leads e compradores aparecem aqui" : "Debug aparece depois do primeiro evento"}</p>
              <p className="text-[13px] mt-1 max-w-md mx-auto" style={{ color: "var(--text-4)" }}>Assim que o Trackfy receber dados desta oferta, esta aba carrega automaticamente. Você também pode clicar em Atualizar dados.</p>
            </div>
          )}

          {summary && (
            <>
              <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3" style={{ background: "linear-gradient(135deg, #0f172a 0%, #111827 58%, #1f2937 100%)" }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "#93c5fd" }}>Performance da oferta</p>
                    <h2 className="text-[18px] font-bold mt-1 text-white">{tracker.name || "Oferta selecionada"}</h2>
                    <p className="text-[12px] mt-1 text-slate-300">{tracker.websiteUrl || "Site sem URL cadastrada"} · últimos {rangeDays === 1 ? "1 dia" : `${rangeDays} dias`}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-3 py-1 text-[11px] font-bold text-emerald-200" style={{ background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.26)" }}>Atualiza 5s</span>
                    <span className="rounded-full px-3 py-1 text-[11px] font-bold text-slate-200" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>Site ID: {tracker.siteId.slice(0, 8)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-6 divide-x divide-y lg:divide-y-0" style={{ borderColor: "var(--border)" }}>
                  {[
                    { label: "Receita", value: revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), detail: refunds > 0 ? `${refunds.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} reembolso` : "pedidos pagos", color: "var(--green)" },
                    { label: "Lucro líquido", value: netRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), detail: "receita - reembolso", color: netRevenue > 0 ? "var(--green)" : "var(--text-2)" },
                    { label: "Pedidos", value: paidOrders, detail: `${summary.totals.purchases} evento${summary.totals.purchases === 1 ? "" : "s"} purchase`, color: "var(--blue)" },
                    { label: "Sessões", value: summary.totals.visits, detail: `${pageViewCount} pageviews`, color: "var(--blue)" },
                    { label: "Ticket médio", value: averageOrder.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), detail: "por pedido pago", color: "var(--yellow)" },
                    { label: "RPS", value: revenuePerSession.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), detail: "receita por sessão", color: "var(--green)" },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 min-h-[116px]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-bold uppercase" style={{ color: "var(--text-4)" }}>{metric.label}</p>
                        <span className="w-2 h-2 rounded-full" style={{ background: metric.color }} />
                      </div>
                      <p className="text-[22px] font-bold mt-2 tabular-nums" style={{ color: "var(--text-1)" }}>{metric.value}</p>
                      <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>{metric.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {purchaseWithoutValue && (
                <div className="rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3" style={{ background: "var(--yellow-light)", border: "1px solid rgba(202,138,4,0.18)" }}>
                  <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: "var(--yellow)" }} strokeWidth={2.35} />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Compra recebida sem valor financeiro</p>
                    <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>O Trackfy recebeu o evento de compra, mas o script ou checkout não enviou <code>value</code>. Para faturamento ficar certo, dispare <code>trackfyPurchase(&#123;transaction_id, value, currency: "BRL"&#125;)</code> na página de obrigado ou use o webhook de venda aprovada.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {[
                  { label: "Order bumps", value: orderBumpCount, detail: "Bumps aceitos/clicados", color: "var(--blue)", event: "order_bump_add" },
                  { label: "Pagamento escolhido", value: paymentSelections || paymentCount, detail: "Pix, cartão ou gateway", color: "var(--yellow)", event: "payment_selected" },
                  { label: "Compra paga", value: summary.totals.purchases, detail: "Purchase confirmado", color: "var(--green)", event: "purchase" },
                  { label: "Pós-venda", value: postPurchaseCount, detail: "Upsell/obrigado clicado", color: "#7c3aed", event: "post_purchase_offer_click" },
                ].map((item) => (
                  <div key={item.label} className="card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-bold" style={{ color: "var(--text-2)" }}>{item.label}</p>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: `${item.color}18`, color: item.color }}>{item.event}</span>
                    </div>
                    <p className="text-[28px] font-bold mt-2 tabular-nums" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>{item.detail}</p>
                  </div>
                ))}
              </div>

              {activeTab === "checkout" && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Instalação para checkout, bumps e pós-venda</h2>
                    <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Use esses eventos na sua página. A compra deve ser disparada somente quando o pagamento estiver aprovado.</p>
                  </div>
                  <button type="button" className="btn-secondary px-3 py-2" onClick={() => handleCopy(`<button data-trackfy-bump="vitalicio" data-trackfy-value="49.90">Adicionar acesso vitalicio</button>
<button data-trackfy-payment="pix" data-trackfy-value="67.90">Pagar com Pix</button>
<script>
window.trackfyPurchase({
  transaction_id: "ID_DO_PEDIDO",
  value: 117.80,
  currency: "BRL",
  name: "Nome do cliente",
  email: "cliente@email.com",
  phone: "11999999999"
});
</script>
<button data-trackfy-post-purchase="upsell_vip" data-trackfy-value="97">Quero o upsell VIP</button>`, "checkout-events")}>
                    {copied === "checkout-events" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied === "checkout-events" ? "Copiado" : "Copiar eventos"}
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <pre className="p-5 overflow-auto text-[11px] leading-relaxed" style={{ background: "#0f172a", color: "#dbeafe" }}><code>{`<!-- Order bump aceito -->
<button data-trackfy-bump="vitalicio" data-trackfy-value="49.90">
  Adicionar acesso vitalicio
</button>

<!-- Metodo de pagamento escolhido -->
<button data-trackfy-payment="pix" data-trackfy-value="117.80">
  Pagar com Pix
</button>

<!-- Pos-venda / upsell -->
<button data-trackfy-post-purchase="upsell_vip" data-trackfy-value="97">
  Quero o upsell VIP
</button>`}</code></pre>
                  <pre className="p-5 overflow-auto text-[11px] leading-relaxed border-t lg:border-t-0 lg:border-l" style={{ background: "var(--bg-subtle)", color: "var(--text-2)", borderColor: "var(--border)" }}><code>{`// Dispare somente apos pagamento aprovado:
window.trackfyPurchase({
  transaction_id: "ID_DO_PEDIDO",
  value: 117.80, // produto + bumps pagos
  currency: "BRL",
  name: "Nome do cliente",
  email: "cliente@email.com",
  phone: "11999999999"
});

// Alternativa por JS:
window.trackfyOrderBump({ id: "vitalicio", value: 49.90 });
window.trackfyPayment({ method: "pix", value: 117.80 });
window.trackfyPostPurchase({ id: "upsell_vip", value: 97 });`}</code></pre>
                </div>
              </div>
              )}

              {activeTab === "data" && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Campanhas por resultado</h2>
                    <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Visual principal para decidir onde subir verba, pausar criativo ou revisar tracking.</p>
                  </div>
                  <span className="badge badge-blue">{summary.campaigns.length} origem{summary.campaigns.length === 1 ? "" : "s"} recebida{summary.campaigns.length === 1 ? "" : "s"}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: "var(--bg-subtle)" }}>
                      <tr>
                        {["Campanha", "Fonte", "Sessões", "Checkout", "Compras", "Receita", "CVR", "Último sinal"].map((column) => (
                          <th key={column} className="px-5 py-3 text-[11px] font-bold uppercase whitespace-nowrap" style={{ color: "var(--text-4)" }}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {summary.campaigns.length === 0 ? (
                        <tr><td colSpan={8} className="px-5 py-8 text-[13px]" style={{ color: "var(--text-4)" }}>Nenhuma UTM chegou nesta oferta ainda.</td></tr>
                      ) : summary.campaigns.map((campaign) => {
                        const campaignRevenue = campaign.revenue ?? 0;
                        const cvr = campaign.visits > 0 ? ((campaign.purchases ?? 0) / campaign.visits) * 100 : 0;
                        return (
                          <tr key={`${campaign.source}-${campaign.medium}-${campaign.campaign}`} className="border-t" style={{ borderColor: "var(--border)" }}>
                            <td className="px-5 py-3 min-w-[190px]">
                              <p className="text-[13px] font-bold truncate max-w-[240px]" style={{ color: "var(--text-1)" }} title={campaign.campaign}>{campaign.campaign}</p>
                              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-4)" }}>{campaign.source}/{campaign.medium}</p>
                            </td>
                            <td className="px-5 py-3"><span className="badge badge-neutral">{campaign.source}</span></td>
                            <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{campaign.visits}</td>
                            <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{campaign.checkouts ?? 0}</td>
                            <td className="px-5 py-3 text-[13px] tabular-nums font-bold" style={{ color: (campaign.purchases ?? 0) > 0 ? "var(--green)" : "var(--text-2)" }}>{campaign.purchases ?? 0}</td>
                            <td className="px-5 py-3 text-[13px] tabular-nums font-bold" style={{ color: campaignRevenue > 0 ? "var(--green)" : "var(--text-2)" }}>{campaignRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                            <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: cvr > 0 ? "var(--green)" : "var(--text-3)" }}>{cvr.toFixed(1)}%</td>
                            <td className="px-5 py-3 text-[12px] whitespace-nowrap" style={{ color: "var(--text-4)" }}>{new Date(campaign.lastSeen).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {activeTab === "contacts" && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Leads e compradores salvos</h2>
                    <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Guarda nome, e-mail e telefone quando seu formulário/checkout envia esses dados ao Trackfy.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-blue">{savedLeads} leads</span>
                    <span className="badge badge-green">{savedBuyers} compradores</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: "var(--bg-subtle)" }}>
                      <tr>
                        {["Contato", "Tipo", "Origem", "Valor", "Último sinal"].map((column) => (
                          <th key={column} className="px-5 py-3 text-[11px] font-bold uppercase whitespace-nowrap" style={{ color: "var(--text-4)" }}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {savedContacts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8">
                            <p className="text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>Nenhum contato salvo ainda.</p>
                            <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Para salvar dados, envie <code>trackfyIdentify(&#123;name,email,phone&#125;)</code>, use um formulário marcado como lead ou passe os dados dentro do <code>trackfyPurchase</code>.</p>
                          </td>
                        </tr>
                      ) : savedContacts.map((contact) => {
                        const isBuyer = contact.ordersCount > 0 || !!contact.purchaseAt;
                        return (
                          <tr key={`${contact.email || contact.phone || contact.firstSeenAt}-${contact.lastSeenAt}`} className="border-t" style={{ borderColor: "var(--border)" }}>
                            <td className="px-5 py-3 min-w-[230px]">
                              <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{contact.name || contact.email || contact.phone || "Contato sem nome"}</p>
                              <p className="text-[11px] mt-0.5 font-mono" style={{ color: "var(--text-4)" }}>{contact.email || "sem e-mail"}{contact.phone ? ` · ${contact.phone}` : ""}</p>
                            </td>
                            <td className="px-5 py-3"><span className={isBuyer ? "badge badge-green" : "badge badge-blue"}>{isBuyer ? "Comprador" : "Lead"}</span></td>
                            <td className="px-5 py-3 text-[12px]" style={{ color: "var(--text-3)" }}>{contact.source} / {contact.medium}<br /><span style={{ color: "var(--text-4)" }}>{contact.campaign}</span></td>
                            <td className="px-5 py-3 text-[13px] font-bold tabular-nums" style={{ color: contact.totalValue > 0 ? "var(--green)" : "var(--text-2)" }}>{contact.totalValue.toLocaleString("pt-BR", { style: "currency", currency: contact.currency || "BRL" })}</td>
                            <td className="px-5 py-3 text-[12px] whitespace-nowrap" style={{ color: "var(--text-4)" }}>{new Date(contact.lastSeenAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {activeTab === "debug" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                {[
                  { label: "Visitantes únicos", value: visitorCount, detail: "Mesmo navegador conta uma vez", tone: "var(--blue)" },
                  { label: "Sessões", value: summary.totals.visits, detail: "Entradas/abas no período", tone: "var(--green)" },
                  { label: "Pageviews", value: pageViewCount, detail: "Todas as páginas abertas no funil", tone: "var(--green)" },
                  { label: "Origem identificada", value: `${attributionRate.toFixed(0)}%`, detail: `${attributedVisitors} visitantes com UTM, busca ou referência`, tone: attributionRate >= 70 ? "var(--green)" : "var(--yellow)" },
                  { label: "Faturamento confirmado", value: revenue > 0 ? revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00", detail: `${paidOrders} pedido${paidOrders === 1 ? "" : "s"} pago${paidOrders === 1 ? "" : "s"}`, tone: revenue > 0 ? "var(--green)" : "var(--text-2)" },
                ].map((metric) => (
                  <div key={metric.label} className="card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-4)" }}>{metric.label}</p>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: metric.tone }} />
                    </div>
                    <p className="text-[25px] font-bold mt-2 tabular-nums" style={{ color: "var(--text-1)" }}>{metric.value}</p>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--text-4)" }}>{metric.detail}</p>
                  </div>
                ))}
              </div>
              )}

              {activeTab === "debug" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Diagnóstico rápido</h2>
                      <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>O Trackfy compara os eventos recebidos e mostra onde o funil ainda precisa de marcação.</p>
                    </div>
                    <Activity className="w-5 h-5" style={{ color: "var(--blue)" }} strokeWidth={2.25} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        title: summary.totals.visits > 0 ? "Script instalado" : "Sem tráfego ainda",
                        status: summary.totals.visits > 0 ? "OK" : "Aguardando",
                        text: summary.totals.visits > 0 ? "A landing já está enviando page_view para o Trackfy." : "Abra uma URL com UTM depois de instalar o script.",
                        color: summary.totals.visits > 0 ? "var(--green)" : "var(--yellow)",
                      },
                      {
                        title: summary.totals.checkouts > 0 ? "Checkout marcado" : "Checkout zerado",
                        status: summary.totals.checkouts > 0 ? "OK" : "Falta",
                        text: summary.totals.checkouts > 0 ? `${summary.totals.checkouts} ${sessionWord(summary.totals.checkouts)} ${reachedText(summary.totals.checkouts)} ao checkout.` : "Use data-trackfy-funnel=\"begin_checkout\" no botão certo.",
                        color: summary.totals.checkouts > 0 ? "var(--green)" : "var(--yellow)",
                      },
                      {
                        title: summary.totals.purchases > 0 ? "Compra confirmada" : paymentCount > 0 ? "Pagamento aberto" : "Compra ainda não chegou",
                        status: summary.totals.purchases > 0 ? "OK" : checkoutGap > 0 ? "Atenção" : "Falta",
                        text: summary.totals.purchases > 0 ? "O Trackfy já recebeu evento de compra aprovada." : paymentCount > 0 ? `${paymentCount} ${sessionWord(paymentCount)} ${openedText(paymentCount)} pagamento/Pix, mas ainda sem purchase.` : checkoutGap > 0 ? `${checkoutGap} checkout sem purchase. A compra precisa vir do obrigado/webhook.` : "Dispare trackfyPurchase apenas após pagamento aprovado.",
                        color: summary.totals.purchases > 0 ? "var(--green)" : checkoutGap > 0 ? "var(--yellow)" : "var(--text-4)",
                      },
                    ].map((item) => (
                      <div key={item.title} className="rounded-lg p-4" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] font-bold" style={{ color: "var(--text-2)" }}>{item.title}</p>
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ background: `${item.color}18`, color: item.color }}>{item.status}</span>
                        </div>
                        <p className="text-[12px] leading-relaxed mt-2" style={{ color: "var(--text-4)" }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Leitura correta</h2>
                  <div className="space-y-3 mt-4">
                    {[
                      ["Visitantes", "mesmo navegador contado uma vez."],
                      ["Sessões", "entradas/abas diferentes no período."],
                      ["Pageviews", "quantas páginas foram abertas."],
                      ["Checkout", "sessões que clicaram/chegaram no pagamento."],
                      ["Compra", "só vale quando o pagamento foi confirmado."],
                    ].map(([label, text]) => (
                      <div key={label} className="flex gap-3">
                        <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--green)" }} strokeWidth={2.5} />
                        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-3)" }}><strong style={{ color: "var(--text-1)" }}>{label}:</strong> {text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {activeTab === "debug" && (
              <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Origem do tráfego</h2>
                      <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Sessões por canal. Direto sem UTM fica separado de tráfego pago.</p>
                    </div>
                    <BarChart3 className="w-5 h-5" style={{ color: "var(--blue)" }} strokeWidth={2.25} />
                  </div>
                  <div className="space-y-3">
                    {summary.channels.map((channel) => {
                      const width = Math.max(3, Math.round((channel.visits / maxChannelVisits) * 100));
                      const color = channel.channel === "paid" ? "var(--blue)" : channel.channel === "organic" ? "var(--green)" : channel.channel === "direct" ? "var(--yellow)" : "var(--text-4)";
                      return (
                        <div key={channel.channel}>
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <span className="text-[12px] font-bold" style={{ color: "var(--text-2)" }}>{sourceLabel(channel.channel)}</span>
                            <span className="text-[12px] tabular-nums" style={{ color: "var(--text-4)" }}>{channel.visits} sessões · {channel.checkouts} checkout</span>
                          </div>
                          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Precisão do tracking</h2>
                      <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Checks automáticos para evitar leitura errada.</p>
                    </div>
                    <Check className="w-5 h-5" style={{ color: "var(--green)" }} strokeWidth={2.25} />
                  </div>
                  <div className="space-y-3">
                    {precisionChecks.map((check) => (
                      <div key={check.label} className="rounded-lg p-3 flex gap-3" style={{ background: check.ok ? "rgba(22,163,74,0.08)" : "var(--yellow-light)", border: `1px solid ${check.ok ? "rgba(22,163,74,0.16)" : "rgba(202,138,4,0.18)"}` }}>
                        <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: check.ok ? "var(--green)" : "var(--yellow)" }} />
                        <div>
                          <p className="text-[12px] font-bold" style={{ color: "var(--text-2)" }}>{check.label}</p>
                          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--text-4)" }}>{check.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {activeTab === "debug" && (
              <div className="card p-5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Campanhas que chegaram no site</h2>
                    <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Ranking visual das UTMs reais recebidas. Campanha salva mas sem visita não aparece aqui.</p>
                  </div>
                  <TrendingUp className="w-5 h-5" style={{ color: "var(--green)" }} strokeWidth={2.25} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {topCampaigns.length === 0 ? <p className="text-[13px]" style={{ color: "var(--text-4)" }}>Nenhuma campanha recebida ainda.</p> : topCampaigns.map((campaign) => {
                    const width = Math.max(4, Math.round((campaign.visits / maxCampaignVisits) * 100));
                    const checkoutRate = campaign.visits > 0 ? ((campaign.checkouts ?? 0) / campaign.visits) * 100 : 0;
                    return (
                      <div key={`${campaign.source}-${campaign.medium}-${campaign.campaign}`} className="rounded-lg p-4" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold truncate" style={{ color: "var(--text-1)" }}>{campaign.campaign}</p>
                            <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>{campaign.source} / {campaign.medium}</p>
                          </div>
                          <span className="badge badge-blue">{campaign.visits}</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                          <div className="h-full rounded-full" style={{ width: `${width}%`, background: "var(--blue)" }} />
                        </div>
                        <p className="text-[11px] mt-2" style={{ color: "var(--text-4)" }}>{campaign.checkouts ?? 0} checkout · {checkoutRate.toFixed(1)}% sessão &gt; checkout</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Funil em tempo real</h2>
                      <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Período: últimos {rangeDays === 1 ? "1 dia" : `${rangeDays} dias`} · atualizado {new Date(summary.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                    </div>
                    <TrendingUp className="w-5 h-5" style={{ color: "var(--blue)" }} />
                  </div>
                  <div className="space-y-3">
                    {funnelSteps.map((step) => {
                      const max = Math.max(1, summary.totals.visits);
                      const width = Math.max(4, Math.min(100, (step.value / max) * 100));
                      return (
                        <div key={step.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-bold" style={{ color: "var(--text-2)" }}>{step.label}</span>
                            <span className="text-[13px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{step.value}</span>
                          </div>
                          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, background: step.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Sessão > Lead", value: funnelRates.visitToLead, hint: "captação" },
                    { label: "Sessão > Checkout", value: funnelRates.visitToCheckout, hint: "interesse forte" },
                    { label: "Checkout > Compra", value: funnelRates.checkoutToPurchase, hint: "pagamento" },
                    { label: "Sessão > Compra", value: funnelRates.visitToPurchase, hint: "conversão final" },
                  ].map((rate) => (
                    <div key={rate.label} className="card p-4">
                      <p className="text-[11px] font-semibold uppercase" style={{ color: "var(--text-4)" }}>{rate.label}</p>
                      <p className="text-[24px] font-bold mt-1" style={{ color: rate.value > 0 ? "var(--green)" : "var(--text-1)" }}>{rate.value.toFixed(1)}%</p>
                      <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>{rate.hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              {activeTab === "debug" && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Saúde do tracking</h2>
                  <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Mostra sessões/eventos consolidados. Etapa zerada significa que ela ainda não foi instalada ou acionada no site.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "var(--border)" }}>
                  {[
                    { event: "page_view", label: "Sessão aberta", fix: "O script Trackfy no head envia automaticamente." },
                    { event: "view_item", label: "Oferta vista", fix: "Marque o CTA/área com data-trackfy-funnel=\"view_item\"." },
                    { event: "generate_lead", label: "Lead confirmado", fix: "Dispare trackfyEvent após sucesso real do formulário." },
                    { event: "begin_checkout", label: "Checkout iniciado", fix: "Marque o botão de pagamento com begin_checkout." },
                    { event: "add_payment_info", label: "Pix/pagamento", fix: "Dispare add_payment_info ao abrir Pix ou cartão." },
                    { event: "order_bump_add", label: "Order bump", fix: "Use data-trackfy-bump ou trackfyOrderBump no bump." },
                    { event: "purchase", label: "Compra aprovada", fix: "Dispare trackfyPurchase somente após confirmação real." },
                    { event: "post_purchase_offer_click", label: "Pós-venda", fix: "Use data-trackfy-post-purchase no upsell/obrigado." },
                  ].map((step) => {
                    const count = summary.eventCounts?.[step.event] ?? 0;
                    return <div key={step.event} className="p-4"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: count > 0 ? "var(--green)" : "var(--yellow)" }} /><p className="text-[12px] font-bold" style={{ color: "var(--text-2)" }}>{step.label}</p></div><p className="text-[24px] font-bold mt-2" style={{ color: "var(--text-1)" }}>{count}</p><p className="text-[11px] mt-2 leading-relaxed" style={{ color: "var(--text-4)" }}>{count > 0 ? "Evento recebido pelo Trackfy." : step.fix}</p></div>;
                  })}
                </div>
              </div>
              )}
              {activeTab === "debug" && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: "Sessões", value: summary.totals.visits, detail: "pessoas/sessões únicas" },
                  { label: "Leads", value: summary.totals.leads, detail: "sessões com lead" },
                  { label: "Checkout", value: summary.totals.checkouts, detail: "sessões com checkout" },
                  { label: "Pagamento", value: paymentCount, detail: "pix/cartão aberto" },
                  { label: "Compras", value: summary.totals.purchases, detail: "pedido confirmado" },
                ].map((metric) => (
                  <div key={metric.label} className="card p-4">
                    <p className="text-[12px] font-semibold" style={{ color: "var(--text-4)" }}>{metric.label}</p>
                    <p className="text-[24px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{metric.value}</p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>{metric.detail}</p>
                  </div>
                ))}
              </div>
              )}
              {activeTab === "debug" && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Funil por fonte de dados</h2>
                  <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Pago: UTM de mídia. Orgânico: buscador sem UTM. Referência: outro site/rede social. Direto: sem UTM e sem referência.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: "var(--bg-subtle)" }}><tr>
                      {["Fonte", "Sessões", "Leads", "Checkout", "Compras", "Checkout %"].map((column) => <th key={column} className="px-5 py-3 text-[11px] font-bold uppercase" style={{ color: "var(--text-4)" }}>{column}</th>)}
                    </tr></thead>
                    <tbody>{summary.channels.map((channel) => (
                      <tr key={channel.channel} className="border-t" style={{ borderColor: "var(--border)" }}>
                        <td className="px-5 py-3 text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>{sourceLabel(channel.channel)}</td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-3)" }}>{channel.visits}</td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-3)" }}>{channel.leads}</td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-3)" }}>{channel.checkouts}</td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-3)" }}>{channel.purchases}</td>
                        <td className="px-5 py-3 text-[13px] font-semibold" style={{ color: channel.visits > 0 && channel.checkouts > 0 ? "var(--green)" : "var(--text-3)" }}>{channel.visits > 0 ? ((channel.checkouts / channel.visits) * 100).toFixed(1) : "0.0"}%</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
              )}
              {activeTab === "debug" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Páginas rastreadas</h2>
                    <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Aqui são visualizações de página. Uma mesma sessão pode passar por home, checkout e pix.</p>
                  </div>
                  <div className="max-h-[390px] overflow-auto">
                    {summary.pages.length === 0 ? <p className="px-5 py-8 text-[13px]" style={{ color: "var(--text-4)" }}>Nenhuma página recebeu visita ainda.</p> : summary.pages.map((page) => (
                      <div key={page.url || page.path} className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                        <p className="font-mono text-[12px] truncate" title={page.url || page.path} style={{ color: "var(--text-2)" }}>{page.url || page.path}</p>
                        <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>{page.visits} visualizações · {page.leads} leads · {page.checkouts} checkout · {page.purchases} compras</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>UTMs e campanhas recebidas</h2>
                    <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Sessões por campanha recebidas de verdade no site.</p>
                  </div>
                  <div className="max-h-[390px] overflow-auto">
                    {summary.campaigns.length === 0 ? <p className="px-5 py-8 text-[13px]" style={{ color: "var(--text-4)" }}>Nenhuma UTM recebida ainda.</p> : summary.campaigns.map((campaign) => (
                      <div key={`${campaign.source}-${campaign.medium}-${campaign.campaign}`} className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-2)" }}>{campaign.campaign}</p>
                        <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>{campaign.source} / {campaign.medium} · {campaign.visits} sessões · {campaign.checkouts ?? 0} checkout · {campaign.purchases ?? 0} compras</p>
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, campaign.visits > 0 ? ((campaign.checkouts ?? 0) / campaign.visits) * 100 : 0)}%`, background: "var(--green)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <div><h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Atividade recente</h2><p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Atualiza a cada 5 segundos enquanto esta aba estiver aberta.</p></div>
                  <span className="badge badge-blue">Ao vivo</span>
                </div>
                <div className="max-h-[340px] overflow-auto">
                  {summary.recentEvents.length === 0 ? <p className="px-5 py-8 text-[13px]" style={{ color: "var(--text-4)" }}>Aguardando o primeiro evento.</p> : summary.recentEvents.map((event, index) => (
                    <div key={`${event.createdAt}-${index}`} className="px-5 py-3 border-b flex items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
                      <div className="min-w-0"><p className="text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>{event.event}{event.value ? ` · ${event.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}</p><p className="font-mono text-[11px] truncate mt-0.5" style={{ color: "var(--text-4)" }}>{event.source} · {event.campaign} · {event.content || event.page}</p></div>
                      <span className="text-[11px] shrink-0" style={{ color: "var(--text-4)" }}>{new Date(event.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
              </div>
              {activeTab === "debug" && (
              <div className="card p-5 border" style={{ borderColor: "rgba(220,38,38,0.18)", background: "rgba(254,242,242,0.55)" }}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(220,38,38,0.1)" }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: "var(--red)" }} strokeWidth={2.25} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Resetar métricas desta oferta</h2>
                    <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>Apaga eventos, funil e pedidos rastreados deste site ID. Não apaga UTMs salvas, script instalado nem configurações da oferta. Digite RESETAR para liberar.</p>
                  </div>
                  <input value={resetText} onChange={(e) => setResetText(e.target.value)} placeholder="RESETAR" className="input w-full lg:w-36" />
                  <button type="button" onClick={handleResetMetrics} disabled={resettingMetrics || resetText.trim().toUpperCase() !== "RESETAR"} className="btn-secondary px-4 py-2" style={{ color: resetText.trim().toUpperCase() === "RESETAR" ? "var(--red)" : undefined }}>
                    <Trash2 className="w-4 h-4" strokeWidth={2.25} />
                    {resettingMetrics ? "Resetando" : "Resetar"}
                  </button>
                </div>
              </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
