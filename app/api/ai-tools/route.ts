import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type Provider = "gemini" | "openai" | "anthropic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const provider = (body?.provider || "gemini") as Provider;
  const prompt = typeof body?.prompt === "string" ? body.prompt.slice(0, 12000) : "";
  const clientKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
  if (!prompt) return NextResponse.json({ error: "Prompt obrigatório." }, { status: 400 });

  try {
    if (provider === "openai") {
      const key = clientKey || process.env.OPENAI_API_KEY;
      if (!key) return NextResponse.json({ error: "Configure uma OpenAI API Key ou use a chave privada do cliente." }, { status: 400 });
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.7 }),
      });
      const data = await res.json();
      return NextResponse.json({ output: data?.choices?.[0]?.message?.content || data?.error?.message || "Sem resposta." });
    }

    if (provider === "anthropic") {
      const key = clientKey || process.env.ANTHROPIC_API_KEY;
      if (!key) return NextResponse.json({ error: "Configure uma Anthropic API Key ou use a chave privada do cliente." }, { status: 400 });
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-3-5-haiku-latest", max_tokens: 1800, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      return NextResponse.json({ output: data?.content?.[0]?.text || data?.error?.message || "Sem resposta." });
    }

    const key = clientKey || process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "Configure uma Gemini API Key ou use a chave privada do cliente." }, { status: 400 });
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await res.json();
    return NextResponse.json({ output: data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.error?.message || "Sem resposta." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao gerar com IA." }, { status: 500 });
  }
}
