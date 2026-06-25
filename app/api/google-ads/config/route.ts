import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleAdsAppConfig,
  getRequestUserId,
  normalizeUserId,
  publicGoogleAdsAppConfig,
  saveGoogleAdsAppConfig,
} from "@/lib/google-ads/server";

export const runtime = "nodejs";

function isAdminUser(userId: string) {
  const admins = (process.env.TRACKFY_ADMIN_EMAILS || "emailjg4@gmail.com")
    .split(",")
    .map((email) => normalizeUserId(email))
    .filter(Boolean);
  return admins.includes(normalizeUserId(userId));
}

export async function GET() {
  const config = await getGoogleAdsAppConfig();
  return NextResponse.json(publicGoogleAdsAppConfig(config));
}

export async function POST(req: NextRequest) {
  const userId = getRequestUserId(req);
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: "Apenas admin pode configurar o app Google Ads." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const origin = new URL(req.url).origin;
  const config = await saveGoogleAdsAppConfig({
    clientId: body.clientId,
    clientSecret: body.clientSecret,
    redirectUri: body.redirectUri || `${origin}/api/google-ads/oauth/callback`,
    developerToken: body.developerToken,
    apiVersion: body.apiVersion || "v22",
  });

  return NextResponse.json({
    ok: true,
    config: publicGoogleAdsAppConfig(config),
  });
}
