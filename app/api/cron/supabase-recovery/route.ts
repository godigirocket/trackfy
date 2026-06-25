import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.SUPABASE_RECOVERY_SECRET;
  return !!secret && request.headers.get("authorization") === `Bearer ${secret}`;
}

async function isDatabaseActive() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    const response = await fetch(`${url}/rest/v1/`, { headers: { apikey: key }, signal: AbortSignal.timeout(5000), cache: "no-store" });
    return response.status < 500;
  } catch { return false; }
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (await isDatabaseActive()) return NextResponse.json({ status: "active", action: "none" });

  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  if (!token || !projectRef) {
    return NextResponse.json({ status: "unavailable", action: "not_configured" }, { status: 503 });
  }

  const response = await fetch(`https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}/restore`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return NextResponse.json({ status: "unavailable", action: "restore_failed" }, { status: 502 });
  return NextResponse.json({ status: "restoring", action: "restore_requested" });
}
