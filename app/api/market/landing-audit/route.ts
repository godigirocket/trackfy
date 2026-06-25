import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function textBetween(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function countMatches(html: string, pattern: RegExp) {
  return html.match(pattern)?.length ?? 0;
}

function extractMeta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return textBetween(html, new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"))
    || textBetween(html, new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, "i"));
}

function scoreFromChecks(checks: Array<{ ok: boolean; weight: number }>) {
  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const got = checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0);
  return Math.round((got / total) * 100);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (!rawUrl) return NextResponse.json({ error: "URL obrigatória." }, { status: 400 });

  let target: URL;
  try {
    target = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json({ error: "URL inválida." }, { status: 400 });
  }
  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ error: "Protocolo inválido." }, { status: 400 });
  }

  try {
    const startedAt = Date.now();
    const response = await fetch(target.toString(), {
      headers: {
        "user-agent": "TrackfyMarketAudit/1.0 (+https://tf.digirocket.site)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    const loadMs = Date.now() - startedAt;
    const title = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = extractMeta(html, "description");
    const canonical = textBetween(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
    const h1 = textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "");
    const h2Count = countMatches(html, /<h2[\s>]/gi);
    const imageCount = countMatches(html, /<img[\s>]/gi);
    const altCount = countMatches(html, /<img[^>]+alt=["'][^"']+["']/gi);
    const internalLinks = countMatches(html, new RegExp(`<a[^>]+href=["'](?:/|${target.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    const externalLinks = countMatches(html, /<a[^>]+href=["']https?:\/\//gi) - internalLinks;
    const forms = countMatches(html, /<form[\s>]/gi);
    const ctas = countMatches(html, /(comprar|checkout|começar|quero|teste|garantir|inscrever|falar no whatsapp|whatsapp)/gi);
    const schema = countMatches(html, /application\/ld\+json/gi);
    const ogImage = extractMeta(html, "og:image");
    const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);

    const checks = [
      { ok: response.ok, weight: 10 },
      { ok: title.length >= 25 && title.length <= 70, weight: 12 },
      { ok: description.length >= 80 && description.length <= 170, weight: 12 },
      { ok: !!h1, weight: 10 },
      { ok: h2Count >= 2, weight: 8 },
      { ok: ctas >= 2, weight: 12 },
      { ok: imageCount === 0 || altCount / imageCount >= 0.6, weight: 8 },
      { ok: !!canonical, weight: 7 },
      { ok: schema > 0, weight: 7 },
      { ok: !!ogImage, weight: 6 },
      { ok: !noindex, weight: 8 },
    ];
    const score = scoreFromChecks(checks);
    const opportunities = [
      title ? "" : "Adicionar title com promessa clara e palavra-chave principal.",
      description ? "" : "Adicionar meta description com benefício, prova e CTA.",
      h1 ? "" : "Adicionar um H1 único com a oferta ou categoria principal.",
      h2Count >= 2 ? "" : "Adicionar seções H2 para benefícios, prova, dúvidas e garantia.",
      ctas >= 2 ? "" : "Reforçar CTAs visíveis no topo, meio e fim da página.",
      canonical ? "" : "Adicionar canonical para evitar páginas duplicadas competindo entre si.",
      schema ? "" : "Adicionar schema JSON-LD de Product, FAQ ou Organization.",
      noindex ? "Remover noindex se esta página precisa ranquear e receber tráfego." : "",
    ].filter(Boolean);

    return NextResponse.json({
      url: target.toString(),
      status: response.status,
      loadMs,
      score,
      title,
      description,
      h1,
      h2Count,
      imageCount,
      altCoverage: imageCount ? Math.round((altCount / imageCount) * 100) : 100,
      internalLinks: Math.max(0, internalLinks),
      externalLinks: Math.max(0, externalLinks),
      forms,
      ctas,
      canonical,
      schema,
      ogImage,
      noindex,
      opportunities,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível auditar a página." }, { status: 500 });
  }
}
