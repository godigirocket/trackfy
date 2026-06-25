import { NextRequest, NextResponse } from "next/server";
import { connectionBelongsToUser, getConnection, getRequestUserId, googleAdsSearch } from "@/lib/google-ads/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const userId = getRequestUserId(req);
  if (!userId) return NextResponse.json({ error: "Trackfy user required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { connectionId, query } = body as Record<string, string>;

  if (!connectionId) return NextResponse.json({ error: "Google Ads connection required" }, { status: 400 });
  if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

  const connection = await getConnection(connectionId);
  if (!connection) return NextResponse.json({ error: "Google Ads connection not found" }, { status: 404 });
  if (!connectionBelongsToUser(connection, userId)) {
    return NextResponse.json({ error: "Google Ads connection not found" }, { status: 404 });
  }
  if (connection.status === "needs_reauth") {
    return NextResponse.json({ error: "Reconecte sua conta Google Ads." }, { status: 401 });
  }

  try {
    const results = await googleAdsSearch(connection, query);
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Google Ads request failed" }, { status: 500 });
  }
}
