import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ status: "not_configured" }, { status: 503 });

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    // A API REST pode responder 401 na raiz mesmo ativa; qualquer resposta do
    // servidor Supabase indica que o projeto está operacional.
    return NextResponse.json({ status: response.status < 500 ? "active" : "unavailable", code: response.status });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}
