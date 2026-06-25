import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
const META_BASE = "https://graph.facebook.com/v19.0";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") ?? "";
  const token = searchParams.get("token") ?? "";

  if (!token) return NextResponse.json({ error: "Token required" }, { status: 401 });

  const params = new URLSearchParams(searchParams);
  params.delete("path");
  params.delete("token");
  params.set("access_token", token);

  try {
    const res = await fetch(`${META_BASE}/${path}?${params}`, {
      signal: AbortSignal.timeout(25000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { path, token, ...fields } = body;

  if (!token) return NextResponse.json({ error: "Token required" }, { status: 401 });

  const params = new URLSearchParams({ ...fields, access_token: token });

  try {
    const res = await fetch(`${META_BASE}/${path}`, {
      method: "POST",
      body: params,
      signal: AbortSignal.timeout(25000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
