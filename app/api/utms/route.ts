import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

type UTMRow = {
  id: string;
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string | null;
  content: string | null;
  full: string;
  created_at: string;
};

function dedupeRows(rows: UTMRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.full}|${row.source}|${row.medium}|${row.campaign}|${row.term || ""}|${row.content || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET(request: NextRequest) {
  const supabase = client();
  const siteId = request.nextUrl.searchParams.get("siteId");
  if (!supabase || !siteId) return NextResponse.json({ utms: [] }, { status: 200 });
  const { data, error } = await supabase.from("trackfy_utms").select("id,url,source,medium,campaign,term,content,full:full_url,created_at").eq("site_id", siteId).order("created_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ utms: [] }, { status: 200 });
  return NextResponse.json({ utms: dedupeRows((data ?? []) as UTMRow[]).map((item) => ({ ...item, createdAt: new Date(item.created_at).toLocaleDateString("pt-BR"), clicks: 0 })) });
}

export async function POST(request: NextRequest) {
  const supabase = client();
  if (!supabase) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body?.siteId || !body?.id || !body?.url || !body?.source || !body?.medium || !body?.campaign || !body?.full) return NextResponse.json({ error: "UTM inválida." }, { status: 400 });
  const { data: existing } = await supabase
    .from("trackfy_utms")
    .select("id,url,source,medium,campaign,term,content,full:full_url,created_at")
    .eq("site_id", body.siteId)
    .eq("full_url", body.full)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, deduped: true, utm: existing });
  const { error } = await supabase.from("trackfy_utms").upsert({ id: body.id, site_id: body.siteId, url: body.url, source: body.source, medium: body.medium, campaign: body.campaign, term: body.term || null, content: body.content || null, full_url: body.full }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Não foi possível salvar a UTM." }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = client();
  const id = request.nextUrl.searchParams.get("id");
  const siteId = request.nextUrl.searchParams.get("siteId");
  if (!supabase || !id || !siteId) return NextResponse.json({ error: "UTM inválida." }, { status: 400 });
  const { error } = await supabase.from("trackfy_utms").delete().eq("id", id).eq("site_id", siteId);
  if (error) return NextResponse.json({ error: "Não foi possível excluir a UTM." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
