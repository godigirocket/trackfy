import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, exchangeCodeForTokens } from "@/lib/google/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/login?error=google_denied", req.url));
  }

  if (!code) {
    return NextResponse.redirect(getGoogleAuthUrl());
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    
    const res = NextResponse.redirect(new URL("/", req.url));
    
    if (tokens.access_token) res.cookies.set("google_token", tokens.access_token, { maxAge: 60 });
    if (tokens.refresh_token) res.cookies.set("google_refresh", tokens.refresh_token, { maxAge: 60 * 60 * 24 * 30 });
    
    return res;
  } catch (err: any) {
    console.error("[Google Auth Error]", err);
    return NextResponse.redirect(new URL("/login?error=google_exchange_failed", req.url));
  }
}
