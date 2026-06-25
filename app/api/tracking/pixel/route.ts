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
  const referrer = params.get("referrer") || null;
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  await supabase.from("trackfy_events").insert({
    site_id: siteId.slice(0, 120), event_name: event.replace(/[^a-z0-9_]/gi, "_").toLowerCase().slice(0, 60),
    event_id: params.get("eventId")?.slice(0, 120) || null, page_path: path.slice(0, 500), page_url: cleanPageUrl(params.get("pageUrl")?.slice(0, 2000) || null),
    referrer: referrer?.slice(0, 1000) || null, source: source.slice(0, 300).toLowerCase(), medium: medium.slice(0, 300).toLowerCase(),
    campaign: params.get("campaign")?.slice(0, 300) || "(not set)", term: params.get("term")?.slice(0, 300) || null,
    content: params.get("content")?.slice(0, 300) || null, channel: classifyTraffic({ source, medium, referrer }),
    value: Number.isFinite(Number(params.get("value"))) ? Number(params.get("value")) : null, currency: params.get("currency")?.slice(0, 8).toUpperCase() || "BRL",
  });
  return response();
}
