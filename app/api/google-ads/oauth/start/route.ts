import { NextRequest, NextResponse } from "next/server";
import { cleanCustomerId, getGoogleAdsAppConfig, getRequestUserId, googleOAuthUrl, publicGoogleAdsAppConfig } from "@/lib/google-ads/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = cleanCustomerId(searchParams.get("customer_id") ?? "");
  const loginCustomerId = cleanCustomerId(searchParams.get("login_customer_id") ?? "");
  const popup = searchParams.get("popup") === "1";
  const userId = getRequestUserId(req);

  const config = publicGoogleAdsAppConfig(await getGoogleAdsAppConfig());
  if (!config.oauthConfigured) {
    return NextResponse.json({
      error: "Configure o setup técnico do Google Ads no Trackfy antes de conectar usuários.",
    }, { status: 500 });
  }
  if (!customerId) {
    return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Trackfy user required" }, { status: 401 });
  }

  try {
    return NextResponse.redirect(await googleOAuthUrl({ userId, customerId, loginCustomerId, popup }));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
