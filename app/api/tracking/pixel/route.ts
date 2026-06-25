import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { classifyTraffic } from "@/lib/tracking";

export const runtime = "nodejs";
const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64");

function response() {
  return new Response(gif, { headers: { "content-type": "image/gif", "cache-control": "no-store, max-age=0" } });
}

function cleanPageUrl(pageUrl: string | null) {
  if (!pageUrl) return null;
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
    return pageUrl.length > 180 ? null : pageUrl;
  }
}

function cleanEmail(value: string | null) {
  if (!value) return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 180 ? email : null;
}

function cleanPhone(value: string | null) {
  if (!value) return null;
  const phone = value.replace(/\D/g, "");
  return phone.length >= 10 && phone.length <= 15 ? phone : null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const siteId = params.get("siteId");
  const event = params.get("event");
  const path = params.get("path");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!siteId || !event || !path || !url || !key) return response();

  const source = params.get("source") || "direct";
  const medium = params.get("medium") || "direct";
  const campaign = params.get("campaign")?.slice(0, 300) || "(not set)";
  const referrer = params.get("referrer") || null;
  const eventName = event.replace(/[^a-z0-9_]/gi, "_").toLowerCase().slice(0, 60);
  const channel = classifyTraffic({ source, medium, referrer });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  await supabase.from("trackfy_events").insert({
    site_id: siteId.slice(0, 120), event_name: eventName,
    event_id: params.get("eventId")?.slice(0, 120) || null, page_path: path.slice(0, 500), page_url: cleanPageUrl(params.get("pageUrl")?.slice(0, 2000) || null),
    referrer: referrer?.slice(0, 1000) || null, source: source.slice(0, 300).toLowerCase(), medium: medium.slice(0, 300).toLowerCase(),
    campaign, term: params.get("term")?.slice(0, 300) || null,
    content: params.get("content")?.slice(0, 300) || null, channel,
    value: Number.isFinite(Number(params.get("value"))) ? Number(params.get("value")) : null, currency: params.get("currency")?.slice(0, 8).toUpperCase() || "BRL",
  });
  if (eventName === "purchase") {
    await supabase.from("trackfy_orders").upsert({
      site_id: siteId.slice(0, 120),
      transaction_id: params.get("eventId")?.slice(0, 120) || `${siteId.slice(0, 120)}-${Date.now()}`,
      status: "paid",
      value: Number.isFinite(Number(params.get("value"))) ? Math.max(0, Number(params.get("value"))) : 0,
      currency: params.get("currency")?.slice(0, 8).toUpperCase() || "BRL",
      product: null,
      source: source.slice(0, 300).toLowerCase(),
      medium: medium.slice(0, 300).toLowerCase(),
      campaign,
      channel,
      updated_at: new Date().toISOString(),
    }, { onConflict: "site_id,transaction_id" });
  }
  if (["identify", "generate_lead", "purchase"].includes(eventName) && params.get("consent") !== "false") {
    const email = cleanEmail(params.get("email"));
    const phone = cleanPhone(params.get("phone"));
    const externalId = params.get("externalId")?.trim().slice(0, 120) || null;
    const name = params.get("name")?.trim().slice(0, 160) || null;
    if (email || phone || externalId) {
      const contactKey = email ? `email:${email}` : phone ? `phone:${phone}` : `external:${externalId}`;
      const now = new Date().toISOString();
      const { data: existing } = await supabase
        .from("trackfy_contacts")
        .select("orders_count,total_value,first_seen_at")
        .eq("site_id", siteId.slice(0, 120))
        .eq("contact_key", contactKey)
        .maybeSingle();
      await supabase.from("trackfy_contacts").upsert({
        site_id: siteId.slice(0, 120),
        contact_key: contactKey,
        email,
        phone,
        name,
        external_id: externalId,
        source: source.slice(0, 300).toLowerCase(),
        medium: medium.slice(0, 300).toLowerCase(),
        campaign,
        channel,
        first_page: existing?.first_seen_at ? undefined : path.slice(0, 500),
        last_page: path.slice(0, 500),
        first_seen_at: existing?.first_seen_at ?? now,
        last_seen_at: now,
        lead_at: eventName === "generate_lead" ? now : undefined,
        purchase_at: eventName === "purchase" ? now : undefined,
        orders_count: Number(existing?.orders_count ?? 0) + (eventName === "purchase" ? 1 : 0),
        total_value: Number(existing?.total_value ?? 0) + (eventName === "purchase" && Number.isFinite(Number(params.get("value"))) ? Math.max(0, Number(params.get("value"))) : 0),
        currency: params.get("currency")?.slice(0, 8).toUpperCase() || "BRL",
        consent: true,
        metadata: {},
      }, { onConflict: "site_id,contact_key" });
    }
  }
  return response();
}
