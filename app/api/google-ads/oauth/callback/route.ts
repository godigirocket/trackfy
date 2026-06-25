import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, upsertConnection, verifyOAuthState } from "@/lib/google-ads/server";

export const runtime = "nodejs";

function popupResponse(origin: string, payload: Record<string, string | boolean>) {
  const json = JSON.stringify({ source: "trackfy-google-ads-oauth", ...payload });
  return new NextResponse(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Google Ads conectado</title>
    <style>
      body{font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a;display:grid;place-items:center;min-height:100vh;margin:0}
      main{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:24px;max-width:360px;text-align:center;box-shadow:0 16px 50px rgba(15,23,42,.12)}
      h1{font-size:18px;margin:0 0 8px}
      p{font-size:13px;line-height:1.5;color:#475569;margin:0}
    </style>
  </head>
  <body>
    <main>
      <h1>${payload.ok ? "Google Ads conectado" : "Não foi possível conectar"}</h1>
      <p>${payload.message || "Você já pode voltar para o Trackfy."}</p>
    </main>
    <script>
      if (window.opener) window.opener.postMessage(${json}, ${JSON.stringify(origin)});
      setTimeout(function(){ window.close(); }, 900);
    </script>
  </body>
</html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return NextResponse.redirect(new URL(`/dashboard/settings?google_ads_error=${encodeURIComponent(error)}`, url.origin));
  if (!code || !state) return NextResponse.json({ error: "Missing OAuth code/state" }, { status: 400 });

  try {
    const payload = verifyOAuthState(state);
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      if (payload.popup === "1") return popupResponse(url.origin, { ok: false, message: "O Google não retornou refresh token. Clique em conectar novamente e aprove o acesso." });
      return NextResponse.redirect(new URL("/dashboard/settings?google_ads_error=missing_refresh_token", url.origin));
    }
    if (!payload.userId) {
      if (payload.popup === "1") return popupResponse(url.origin, { ok: false, message: "Usuário Trackfy não encontrado. Entre novamente e tente conectar." });
      return NextResponse.redirect(new URL("/dashboard/settings?google_ads_error=missing_trackfy_user", url.origin));
    }
    const connection = await upsertConnection({
      userId: payload.userId,
      customerId: payload.customerId,
      loginCustomerId: payload.loginCustomerId,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
    });
    if (payload.popup === "1") {
      return popupResponse(url.origin, {
        ok: true,
        connectionId: connection.id,
        message: "Conexão salva. Esta janela vai fechar sozinha.",
      });
    }
    return NextResponse.redirect(new URL(`/dashboard/settings?google_ads_connection=${connection.id}`, url.origin));
  } catch (e: any) {
    try {
      const payload = state ? verifyOAuthState(state) : {};
      if (payload.popup === "1") return popupResponse(url.origin, { ok: false, message: e.message || "Erro ao conectar Google Ads." });
    } catch {}
    return NextResponse.redirect(new URL(`/dashboard/settings?google_ads_error=${encodeURIComponent(e.message)}`, url.origin));
  }
}
