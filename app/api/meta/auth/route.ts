import { NextRequest, NextResponse } from "next/server";
import { getMetaAuthUrl, exchangeCodeForToken } from "@/lib/meta/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/login?error=meta_denied", req.url));
  }

  // If no code, redirect to Meta auth dialog
  if (!code) {
    return NextResponse.redirect(getMetaAuthUrl());
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    
    // In a real app, we would save this to a DB. 
    // Here we'll pass it to the frontend via a temporary cookie or redirect param.
    // The prompt says "Armazenar access_token, expires_in, ad_account_id no store e localStorage."
    // We can redirect back to a callback page that handles the storage.
    
    const res = NextResponse.redirect(new URL("/", req.url));
    
    // We can set a temporary cookie for the client to pick up and save to localStorage
    res.cookies.set("meta_token", tokenData.access_token, { maxAge: 60 });
    res.cookies.set("meta_expires", String(tokenData.expires_in), { maxAge: 60 });
    
    return res;
  } catch (err: any) {
    console.error("[Meta Auth Error]", err);
    return NextResponse.redirect(new URL("/login?error=meta_exchange_failed", req.url));
  }
}
