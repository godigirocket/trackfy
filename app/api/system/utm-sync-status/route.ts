import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function checkTable(url: string, key: string, table: string) {
  try {
    const response = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const body = await response.text();
    return {
      exists: response.ok,
      status: response.status,
      message: response.ok ? "ok" : body.slice(0, 300),
    };
  } catch (error) {
    return {
      exists: false,
      status: 0,
      message: error instanceof Error ? error.message : "Falha ao consultar tabela.",
    };
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ status: "not_configured" }, { status: 503 });

  const [trackingSites, utmEntries] = await Promise.all([
    checkTable(url, key, "tracking_sites"),
    checkTable(url, key, "utm_entries"),
  ]);

  const ready = trackingSites.exists && utmEntries.exists;
  return NextResponse.json({
    status: ready ? "ready" : "missing_tables",
    tracking_sites: trackingSites,
    utm_entries: utmEntries,
  }, { status: ready ? 200 : 424 });
}
