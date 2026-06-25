import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { message, metrics } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "Chave Gemini não configurada. Adicione GEMINI_API_KEY no .env.local.",
    });
  }

  const prompt = `Você é um especialista em Meta Ads. Responda em português de forma concisa e prática.

Métricas atuais do usuário:
- Investimento total: R$ ${metrics.totalSpend}
- Conversões: ${metrics.totalConversions}
- Impressões: ${metrics.totalImpressions}
- Cliques: ${metrics.totalClicks}
- CTR médio: ${metrics.avgCTR}%
- CPL médio: R$ ${metrics.avgCPL}
- Melhor campanha: ${metrics.topCampaign}
- Campanhas ativas: ${metrics.activeCampaigns}

Pergunta: ${message}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(20000),
      }
    );

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sem resposta da IA.";
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ reply: `Erro: ${e.message}` });
  }
}
