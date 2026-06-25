import { NextRequest, NextResponse } from "next/server";
import {
  cleanCustomerId,
  connectionBelongsToUser,
  getConnection,
  getGoogleAdsAppConfig,
  getRequestUserId,
  getUserConnections,
  publicConnection,
  publicGoogleAdsAppConfig,
  updateConnection,
} from "@/lib/google-ads/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = getRequestUserId(req);
  if (!userId) return NextResponse.json({ error: "Trackfy user required" }, { status: 401 });
  const connections = await getUserConnections(userId);
  const config = publicGoogleAdsAppConfig(await getGoogleAdsAppConfig());
  return NextResponse.json({
    ...config,
    connections: connections.map(publicConnection),
  });
}

export async function PATCH(req: NextRequest) {
  const userId = getRequestUserId(req);
  if (!userId) return NextResponse.json({ error: "Trackfy user required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, customer_id, login_customer_id } = body as Record<string, string>;
  if (!id) return NextResponse.json({ error: "Connection ID required" }, { status: 400 });
  const current = await getConnection(id);
  if (!current) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  if (!connectionBelongsToUser(current, userId)) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  const connection = await updateConnection(id, {
    customer_id: cleanCustomerId(customer_id ?? ""),
    login_customer_id: cleanCustomerId(login_customer_id ?? "") || undefined,
  });
  if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  return NextResponse.json({ connection: publicConnection(connection) });
}
