import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { classifyTraffic } from "@/lib/tracking";

export const runtime = "nodejs";

type SaleWebhook = {
  siteId?: string;
  transactionId?: string;
  status?: "paid" | "refunded" | "pending";
  value?: number;
  currency?: string;
  product?: string;
  source?: string;
  medium?: string;
  campaign?: string;
};

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.TRACKFY_SALES_WEBHOOK_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = client();
  if (!supabase) return NextResponse.json({ error: "Tracking backend não configurado." }, { status: 503 });

  let body: SaleWebhook;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Payload inválido." }, { status: 400 }); }
  const siteId = body.siteId?.trim();
  const transactionId = body.transactionId?.trim();
  const status = body.status ?? "paid";
  const value = Number(body.value);
  if (!siteId || !transactionId || !["paid", "refunded", "pending"].includes(status) || !Number.isFinite(value) || value < 0) {
    return NextResponse.json({ error: "siteId, transactionId, status e value são obrigatórios." }, { status: 400 });
  }

  const source = body.source?.trim().toLowerCase() || "direct";
  const medium = body.medium?.trim().toLowerCase() || "direct";
  const campaign = body.campaign?.trim() || "(not set)";
  const { error } = await supabase.from("trackfy_orders").upsert({
    site_id: siteId, transaction_id: transactionId, status, value,
    currency: body.currency?.trim().toUpperCase() || "BRL", product: body.product?.trim() || null,
    source, medium, campaign, channel: classifyTraffic({ source, medium }), updated_at: new Date().toISOString(),
  }, { onConflict: "site_id,transaction_id" });
  if (error) return NextResponse.json({ error: "Não foi possível gravar a venda." }, { status: 500 });
  return NextResponse.json({ ok: true, transactionId, status });
}
