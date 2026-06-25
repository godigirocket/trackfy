import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { classifyTraffic } from "@/lib/tracking";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { ...corsHeaders, ...(init?.headers ?? {}) } });
}

type TrackingPayload = {
  siteId?: string;
  event?: string;
  path?: string;
  pageUrl?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  eventId?: string;
  value?: number;
  currency?: string;
};

function trackingClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function validText(value: unknown, max = 300) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

function cleanPageUrl(pageUrl: string | null, fallbackPath: string) {
  if (!pageUrl) return fallbackPath;
  try {
    const url = new URL(pageUrl);
    const keptParams = new URLSearchParams();
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "plano"].forEach((key) => {
      const value = url.searchParams.get(key);
      if (value) keptParams.set(key, value.slice(0, 120));
    });
    const query = keptParams.toString();
    return `${url.origin}${url.pathname}${query ? `?${query}` : ""}`;
  } catch {
    return pageUrl.length > 180 ? fallbackPath : pageUrl;
  }
}

type TrackingRow = {
  event_name: string;
  event_id: string | null;
  page_path: string;
  page_url: string | null;
  source: string;
  medium: string;
  campaign: string;
  channel: string;
  created_at: string;
  value: number | null;
};

function uniqueRows(rows: TrackingRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const channel = classifyTraffic({ source: row.source, medium: row.medium, referrer: null });
    row.channel = channel;
    const bucket = Math.floor(new Date(row.created_at).getTime() / 2000);
    const key = row.event_id
      ? `${row.event_name}|${row.event_id}`
      : `${row.event_name}|${row.page_path}|${row.source}|${row.medium}|${row.campaign}|${bucket}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sessionKey(row: TrackingRow) {
  if (row.event_id?.includes("|")) return row.event_id.split("|")[0];
  return row.event_id || `${row.source}|${row.medium}|${row.campaign}|${row.created_at.slice(0, 16)}`;
}

function uniqueSessionCount(rows: TrackingRow[]) {
  return new Set(rows.filter((row) => row.event_name === "page_view").map(sessionKey)).size;
}

export async function POST(request: NextRequest) {
  const supabase = trackingClient();
  if (!supabase) {
    return json({ error: "Tracking backend ainda não configurado." }, { status: 503 });
  }

  let body: TrackingPayload;
  try { body = await request.json(); } catch { return json({ error: "Evento inválido." }, { status: 400 }); }
  if (!validText(body.siteId, 120) || !validText(body.event, 60) || !validText(body.path, 500)) {
    return json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  const event = body.event!.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  const source = validText(body.source) ? body.source!.trim().toLowerCase() : "direct";
  const medium = validText(body.medium) ? body.medium!.trim().toLowerCase() : "direct";
  const referrer = validText(body.referrer, 1000) ? body.referrer!.trim() : null;
  const { error } = await supabase.from("trackfy_events").insert({
    site_id: body.siteId!.trim(),
    event_name: event,
    event_id: validText(body.eventId, 120) ? body.eventId!.trim() : null,
    page_path: body.path!.trim(),
    page_url: validText(body.pageUrl, 2000) ? body.pageUrl!.trim() : null,
    referrer,
    source,
    medium,
    campaign: validText(body.campaign) ? body.campaign!.trim() : "(not set)",
    term: validText(body.term) ? body.term!.trim() : null,
    content: validText(body.content) ? body.content!.trim() : null,
    channel: classifyTraffic({ source, medium, referrer }),
    value: Number.isFinite(Number(body.value)) ? Number(body.value) : null,
    currency: validText(body.currency, 8) ? body.currency!.trim().toUpperCase() : "BRL",
  });
  if (error) return json({ error: "Não foi possível registrar o evento." }, { status: 500 });
  return json({ ok: true }, { status: 201 });
}

export function OPTIONS() { return new NextResponse(null, { status: 204, headers: corsHeaders }); }

export async function GET(request: NextRequest) {
  const supabase = trackingClient();
  const siteId = request.nextUrl.searchParams.get("siteId");
  if (!supabase) return json({ error: "Tracking backend ainda não configurado." }, { status: 503 });
  if (!siteId || siteId.length > 120) return json({ error: "siteId obrigatório." }, { status: 400 });

  const daysParam = Number(request.nextUrl.searchParams.get("days") ?? "30");
  const days = [1, 3, 7, 14, 30, 90].includes(daysParam) ? daysParam : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("trackfy_events")
    .select("event_name,event_id,page_path,page_url,source,medium,campaign,channel,created_at,value")
    .eq("site_id", siteId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) return json({ error: "Não foi possível carregar os dados." }, { status: 500 });

  const { data: orderData, error: orderError } = await supabase
    .from("trackfy_orders")
    .select("transaction_id,status,value,currency,product,source,medium,campaign,channel,created_at,updated_at")
    .eq("site_id", siteId)
    .gte("updated_at", since)
    .order("updated_at", { ascending: false })
    .limit(5000);
  // Permite publicar o painel antes de a migração de pedidos ser executada.
  const orders = orderError ? [] : orderData ?? [];

  const rows = uniqueRows((data ?? []) as TrackingRow[]);
  const eventCounts = ["page_view", "view_item", "generate_lead", "begin_checkout", "purchase"].reduce<Record<string, number>>((counts, eventName) => {
    counts[eventName] = eventName === "purchase"
      ? new Set(rows.filter((row) => row.event_name === eventName).map((row) => row.event_id).filter(Boolean)).size
      : rows.filter((row) => row.event_name === eventName).length;
    return counts;
  }, {});
  const channels = ["paid", "organic", "referral", "direct", "unknown"].map((channel) => {
    const channelOrders = orders.filter((order) => order.channel === channel);
    const revenue = channelOrders.filter((order) => order.status === "paid").reduce((sum, order) => sum + Number(order.value), 0);
    const refunds = channelOrders.filter((order) => order.status === "refunded").reduce((sum, order) => sum + Number(order.value), 0);
    const visits = uniqueSessionCount(rows.filter((row) => row.channel === channel));
    return {
      channel, visits,
      leads: rows.filter((row) => row.event_name === "generate_lead" && row.channel === channel).length,
      checkouts: rows.filter((row) => row.event_name === "begin_checkout" && row.channel === channel).length,
      purchases: new Set(rows.filter((row) => row.event_name === "purchase" && row.channel === channel).map((row) => row.event_id).filter(Boolean)).size,
      paidOrders: channelOrders.filter((order) => order.status === "paid").length,
      refunds: channelOrders.filter((order) => order.status === "refunded").length,
      revenue, netRevenue: revenue - refunds, conversionRate: visits > 0 ? (channelOrders.filter((order) => order.status === "paid").length / visits) * 100 : 0,
    };
  });
  const pages = Object.values(rows.reduce<Record<string, { path: string; url: string | null; visits: number; leads: number; checkouts: number; purchases: number; lastSeen: string }>>((all, row) => {
    const cleanUrl = cleanPageUrl(row.page_url, row.page_path);
    const key = cleanUrl || row.page_path;
    if (!all[key]) all[key] = { path: row.page_path, url: cleanUrl, visits: 0, leads: 0, checkouts: 0, purchases: 0, lastSeen: row.created_at };
    const page = all[key];
    if (row.event_name === "page_view") page.visits += 1;
    if (row.event_name === "generate_lead") page.leads += 1;
    if (row.event_name === "begin_checkout") page.checkouts += 1;
    if (row.event_name === "purchase") page.purchases += 1;
    return all;
  }, {})).sort((a, b) => b.visits - a.visits || b.lastSeen.localeCompare(a.lastSeen)).slice(0, 50);
  const campaigns = Object.values(rows.reduce<Record<string, { source: string; medium: string; campaign: string; visits: number; leads: number; checkouts: number; purchases: number; lastSeen: string }>>((all, row) => {
    const key = `${row.source}|${row.medium}|${row.campaign}`;
    if (!all[key]) all[key] = { source: row.source, medium: row.medium, campaign: row.campaign, visits: 0, leads: 0, checkouts: 0, purchases: 0, lastSeen: row.created_at, sessionKeys: new Set<string>() } as any;
    if (row.event_name === "page_view") (all[key] as any).sessionKeys.add(sessionKey(row));
    if (row.event_name === "generate_lead") all[key].leads += 1;
    if (row.event_name === "begin_checkout") all[key].checkouts += 1;
    if (row.event_name === "purchase") all[key].purchases += 1;
    if (row.created_at > all[key].lastSeen) all[key].lastSeen = row.created_at;
    return all;
  }, {})).map((campaign) => {
    const campaignOrders = orders.filter((order) => order.source === campaign.source && order.medium === campaign.medium && order.campaign === campaign.campaign);
    const revenue = campaignOrders.filter((order) => order.status === "paid").reduce((sum, order) => sum + Number(order.value), 0);
    const refunds = campaignOrders.filter((order) => order.status === "refunded").reduce((sum, order) => sum + Number(order.value), 0);
    const paidOrders = campaignOrders.filter((order) => order.status === "paid").length;
    const visits = (campaign as any).sessionKeys?.size ?? campaign.visits;
    const { sessionKeys, ...cleanCampaign } = campaign as any;
    return { ...cleanCampaign, visits, paidOrders, refunds: campaignOrders.filter((order) => order.status === "refunded").length, revenue, netRevenue: revenue - refunds, conversionRate: visits > 0 ? (paidOrders / visits) * 100 : 0, averageOrder: paidOrders > 0 ? revenue / paidOrders : 0 };
  }).sort((a, b) => b.netRevenue - a.netRevenue || b.visits - a.visits).slice(0, 50);
  return json({
    updatedAt: new Date().toISOString(),
    range: { days, since },
    totals: {
      visits: uniqueSessionCount(rows),
      leads: rows.filter((row) => row.event_name === "generate_lead").length,
      checkouts: rows.filter((row) => row.event_name === "begin_checkout").length,
      purchases: new Set(rows.filter((row) => row.event_name === "purchase").map((row) => row.event_id).filter(Boolean)).size,
      paidOrders: orders.filter((order) => order.status === "paid").length,
      refundedOrders: orders.filter((order) => order.status === "refunded").length,
      revenue: orders.filter((order) => order.status === "paid").reduce((sum, order) => sum + Number(order.value), 0),
      refunds: orders.filter((order) => order.status === "refunded").reduce((sum, order) => sum + Number(order.value), 0),
    },
    eventCounts,
    channels,
    pages,
    campaigns,
    orders: orders.slice(0, 100).map((order) => ({ transactionId: order.transaction_id, status: order.status, value: Number(order.value), currency: order.currency, product: order.product, source: order.source, medium: order.medium, campaign: order.campaign, createdAt: order.created_at, updatedAt: order.updated_at })),
    recentEvents: rows.slice(0, 20).map((row) => ({ event: row.event_name, page: row.page_path, source: row.source, campaign: row.campaign, createdAt: row.created_at })),
  });
}
