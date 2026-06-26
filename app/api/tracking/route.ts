import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { classifyTraffic } from "@/lib/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store, max-age=0",
      ...(init?.headers ?? {}),
    },
  });
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
  name?: string;
  email?: string;
  phone?: string;
  externalId?: string;
  consent?: boolean;
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

function contentFromUrl(pageUrl: string | null) {
  if (!pageUrl) return undefined;
  try {
    const url = new URL(pageUrl, "https://trackfy.local");
    return url.searchParams.get("utm_content") ?? undefined;
  } catch {
    return undefined;
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

function isInternalTest(row: TrackingRow) {
  const campaign = row.campaign.trim().toLowerCase();
  return campaign.startsWith("trackfy_")
    || campaign.includes("browser_check")
    || ["manual-cors-check", "pixel-endpoint-test", "reset_test"].includes(campaign);
}

function eventIdentity(row: TrackingRow) {
  const parts = row.event_id?.split("|") ?? [];
  if (parts.length >= 3 && parts[2] === row.event_name) {
    return { visitor: parts[0], session: parts[1] };
  }
  if (parts.length >= 2 && parts[1] === row.event_name) {
    return { visitor: parts[0], session: parts[0] };
  }
  const fallback = row.event_id || `${row.source}|${row.medium}|${row.campaign}|${row.created_at.slice(0, 16)}`;
  return { visitor: fallback, session: fallback };
}

function sessionKey(row: TrackingRow) {
  const identity = eventIdentity(row);
  if (identity.session) return `${identity.session}|${row.source}|${row.medium}|${row.campaign}`;
  return row.event_id || `${row.source}|${row.medium}|${row.campaign}|${row.created_at.slice(0, 16)}`;
}

function visitorKey(row: TrackingRow) {
  const identity = eventIdentity(row);
  return identity.visitor || sessionKey(row);
}

function uniqueSessionCount(rows: TrackingRow[]) {
  return new Set(rows.filter((row) => row.event_name === "page_view").map(sessionKey)).size;
}

function uniqueVisitorCount(rows: TrackingRow[]) {
  return new Set(rows.filter((row) => row.event_name === "page_view").map(visitorKey)).size;
}

function uniqueEventSessionCount(rows: TrackingRow[], eventName: string) {
  return new Set(rows.filter((row) => row.event_name === eventName).map(sessionKey)).size;
}

function uniqueEventCount(rows: TrackingRow[], eventName: string) {
  const eventRows = rows.filter((row) => row.event_name === eventName);
  const withId = eventRows.map((row) => row.event_id).filter(Boolean);
  if (withId.length) return new Set(withId).size;
  return eventRows.length;
}

function uniquePurchaseCount(rows: TrackingRow[]) {
  const purchaseRows = rows.filter((row) => row.event_name === "purchase");
  const withId = purchaseRows.map((row) => row.event_id).filter(Boolean);
  if (withId.length) return new Set(withId).size;
  return new Set(purchaseRows.map(sessionKey)).size;
}

function moneyValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function cleanEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 180 ? email : null;
}

function cleanPhone(value: unknown) {
  if (typeof value !== "string") return null;
  const phone = value.replace(/\D/g, "");
  return phone.length >= 10 && phone.length <= 15 ? phone : null;
}

function cleanContactText(value: unknown, max = 180) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim().slice(0, max) : null;
}

async function upsertContact(input: {
  supabase: ReturnType<typeof trackingClient>;
  siteId: string;
  event: string;
  source: string;
  medium: string;
  campaign: string;
  channel: string;
  page: string;
  body: TrackingPayload;
}) {
  if (!input.supabase || input.body.consent === false) return;
  const email = cleanEmail(input.body.email);
  const phone = cleanPhone(input.body.phone);
  const externalId = cleanContactText(input.body.externalId, 120);
  const name = cleanContactText(input.body.name, 160);
  if (!email && !phone && !externalId) return;

  const contactKey = email ? `email:${email}` : phone ? `phone:${phone}` : `external:${externalId}`;
  const isLead = input.event === "generate_lead";
  const isPurchase = input.event === "purchase";
  const value = isPurchase ? moneyValue(input.body.value) : 0;
  const now = new Date().toISOString();

  const { data: existing } = await input.supabase
    .from("trackfy_contacts")
    .select("orders_count,total_value,first_seen_at")
    .eq("site_id", input.siteId)
    .eq("contact_key", contactKey)
    .maybeSingle();

  await input.supabase.from("trackfy_contacts").upsert({
    site_id: input.siteId,
    contact_key: contactKey,
    email,
    phone,
    name,
    external_id: externalId,
    source: input.source,
    medium: input.medium,
    campaign: input.campaign,
    channel: input.channel,
    first_page: existing?.first_seen_at ? undefined : input.page,
    last_page: input.page,
    first_seen_at: existing?.first_seen_at ?? now,
    last_seen_at: now,
    lead_at: isLead ? now : undefined,
    purchase_at: isPurchase ? now : undefined,
    orders_count: Number(existing?.orders_count ?? 0) + (isPurchase ? 1 : 0),
    total_value: Number(existing?.total_value ?? 0) + value,
    currency: validText(input.body.currency, 8) ? input.body.currency!.trim().toUpperCase() : "BRL",
    consent: true,
    metadata: {},
  }, { onConflict: "site_id,contact_key" });
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
  const campaign = validText(body.campaign) ? body.campaign!.trim() : "(not set)";
  const referrer = validText(body.referrer, 1000) ? body.referrer!.trim() : null;
  const channel = classifyTraffic({ source, medium, referrer });
  const { error } = await supabase.from("trackfy_events").insert({
    site_id: body.siteId!.trim(),
    event_name: event,
    event_id: validText(body.eventId, 120) ? body.eventId!.trim() : null,
    page_path: body.path!.trim(),
    page_url: validText(body.pageUrl, 2000) ? body.pageUrl!.trim() : null,
    referrer,
    source,
    medium,
    campaign,
    term: validText(body.term) ? body.term!.trim() : null,
    content: validText(body.content) ? body.content!.trim() : null,
    channel,
    value: Number.isFinite(Number(body.value)) ? Number(body.value) : null,
    currency: validText(body.currency, 8) ? body.currency!.trim().toUpperCase() : "BRL",
  });
  if (error) return json({ error: "Não foi possível registrar o evento." }, { status: 500 });

  if (event === "purchase") {
    const transactionId = validText(body.eventId, 120)
      ? body.eventId!.trim()
      : `${body.siteId!.trim()}-${Date.now()}`;
    await supabase.from("trackfy_orders").upsert({
      site_id: body.siteId!.trim(),
      transaction_id: transactionId,
      status: "paid",
      value: moneyValue(body.value),
      currency: validText(body.currency, 8) ? body.currency!.trim().toUpperCase() : "BRL",
      product: null,
      source,
      medium,
      campaign,
      channel,
      updated_at: new Date().toISOString(),
    }, { onConflict: "site_id,transaction_id" });
  }
  if (["identify", "generate_lead", "purchase"].includes(event)) {
    await upsertContact({ supabase, siteId: body.siteId!.trim(), event, source, medium, campaign, channel, page: body.path!.trim(), body });
  }
  return json({ ok: true }, { status: 201 });
}

export function OPTIONS() { return new NextResponse(null, { status: 204, headers: corsHeaders }); }

export async function DELETE(request: NextRequest) {
  const supabase = trackingClient();
  if (!supabase) return json({ error: "Tracking backend ainda não configurado." }, { status: 503 });

  const siteId = request.nextUrl.searchParams.get("siteId");
  const confirm = request.nextUrl.searchParams.get("confirm");
  if (!siteId || siteId.length > 120) return json({ error: "siteId obrigatório." }, { status: 400 });
  if (confirm !== siteId) return json({ error: "Confirmação inválida." }, { status: 400 });

  const orderResult = await supabase.from("trackfy_orders").delete().eq("site_id", siteId);
  const eventResult = await supabase.from("trackfy_events").delete().eq("site_id", siteId);
  await supabase.from("trackfy_contacts").delete().eq("site_id", siteId);
  if (orderResult.error || eventResult.error) return json({ error: "Não foi possível resetar as métricas." }, { status: 500 });

  return json({ ok: true, siteId });
}

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

  const { data: contactData } = await supabase
    .from("trackfy_contacts")
    .select("email,phone,name,source,medium,campaign,channel,first_page,last_page,first_seen_at,last_seen_at,lead_at,purchase_at,orders_count,total_value,currency")
    .eq("site_id", siteId)
    .order("last_seen_at", { ascending: false })
    .limit(200);
  const contacts = contactData ?? [];

  const rows = uniqueRows(((data ?? []) as TrackingRow[]).filter((row) => !isInternalTest(row)));
  const pageViews = rows.filter((row) => row.event_name === "page_view").length;
  const attributedSessions = uniqueSessionCount(rows.filter((row) => row.channel !== "direct" && row.channel !== "unknown"));
  const attributedVisitors = uniqueVisitorCount(rows.filter((row) => row.channel !== "direct" && row.channel !== "unknown"));
  const eventCounts = ["page_view", "view_item", "generate_lead", "begin_checkout", "add_payment_info", "payment_selected", "order_bump_add", "order_bump_remove", "purchase", "post_purchase_view", "post_purchase_offer_click", "upsell_click"].reduce<Record<string, number>>((counts, eventName) => {
    counts[eventName] = eventName === "purchase"
      ? uniquePurchaseCount(rows)
      : eventName === "page_view"
        ? uniqueSessionCount(rows)
        : ["order_bump_add", "order_bump_remove", "payment_selected", "post_purchase_view", "post_purchase_offer_click", "upsell_click"].includes(eventName)
          ? uniqueEventCount(rows, eventName)
          : uniqueEventSessionCount(rows, eventName);
    return counts;
  }, {});
  const channels = ["paid", "organic", "referral", "direct", "unknown"].map((channel) => {
    const channelOrders = orders.filter((order) => order.channel === channel);
    const revenue = channelOrders.filter((order) => order.status === "paid").reduce((sum, order) => sum + Number(order.value), 0);
    const refunds = channelOrders.filter((order) => order.status === "refunded").reduce((sum, order) => sum + Number(order.value), 0);
    const visits = uniqueSessionCount(rows.filter((row) => row.channel === channel));
    return {
      channel, visits,
      leads: uniqueEventSessionCount(rows.filter((row) => row.channel === channel), "generate_lead"),
      checkouts: uniqueEventSessionCount(rows.filter((row) => row.channel === channel), "begin_checkout"),
      purchases: uniquePurchaseCount(rows.filter((row) => row.channel === channel)),
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
    const campaignRows = rows.filter((row) => row.source === campaign.source && row.medium === campaign.medium && row.campaign === campaign.campaign);
    const { sessionKeys, ...cleanCampaign } = campaign as any;
    return { ...cleanCampaign, visits, leads: uniqueEventSessionCount(campaignRows, "generate_lead"), checkouts: uniqueEventSessionCount(campaignRows, "begin_checkout"), purchases: uniquePurchaseCount(campaignRows), paidOrders, refunds: campaignOrders.filter((order) => order.status === "refunded").length, revenue, netRevenue: revenue - refunds, conversionRate: visits > 0 ? (paidOrders / visits) * 100 : 0, averageOrder: paidOrders > 0 ? revenue / paidOrders : 0 };
  }).sort((a, b) => b.netRevenue - a.netRevenue || b.visits - a.visits).slice(0, 50);
  return json({
    updatedAt: new Date().toISOString(),
    range: { days, since },
    totals: {
      visits: uniqueSessionCount(rows),
      visitors: uniqueVisitorCount(rows),
      pageViews,
      leads: uniqueEventSessionCount(rows, "generate_lead"),
      checkouts: uniqueEventSessionCount(rows, "begin_checkout"),
      payments: uniqueEventSessionCount(rows, "add_payment_info"),
      paymentSelections: uniqueEventCount(rows, "payment_selected"),
      orderBumps: uniqueEventCount(rows, "order_bump_add"),
      postPurchaseClicks: uniqueEventCount(rows, "post_purchase_offer_click") + uniqueEventCount(rows, "upsell_click"),
      purchases: uniquePurchaseCount(rows),
      events: rows.length,
      attributedSessions,
      attributedVisitors,
      paidOrders: orders.filter((order) => order.status === "paid").length,
      refundedOrders: orders.filter((order) => order.status === "refunded").length,
      revenue: orders.filter((order) => order.status === "paid").reduce((sum, order) => sum + Number(order.value), 0),
      refunds: orders.filter((order) => order.status === "refunded").reduce((sum, order) => sum + Number(order.value), 0),
      savedLeads: contacts.filter((contact) => contact.lead_at).length,
      savedBuyers: contacts.filter((contact) => contact.purchase_at || Number(contact.orders_count) > 0).length,
    },
    eventCounts,
    channels,
    pages,
    campaigns,
    orders: orders.slice(0, 100).map((order) => ({ transactionId: order.transaction_id, status: order.status, value: Number(order.value), currency: order.currency, product: order.product, source: order.source, medium: order.medium, campaign: order.campaign, createdAt: order.created_at, updatedAt: order.updated_at })),
    contacts: contacts.slice(0, 100).map((contact) => ({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      source: contact.source,
      medium: contact.medium,
      campaign: contact.campaign,
      channel: contact.channel,
      firstPage: contact.first_page,
      lastPage: contact.last_page,
      firstSeenAt: contact.first_seen_at,
      lastSeenAt: contact.last_seen_at,
      leadAt: contact.lead_at,
      purchaseAt: contact.purchase_at,
      ordersCount: Number(contact.orders_count ?? 0),
      totalValue: Number(contact.total_value ?? 0),
      currency: contact.currency,
    })),
    recentEvents: rows.slice(0, 30).map((row) => ({ event: row.event_name, page: row.page_path, source: row.source, campaign: row.campaign, content: contentFromUrl(row.page_url), value: Number(row.value ?? 0), createdAt: row.created_at })),
  });
}
