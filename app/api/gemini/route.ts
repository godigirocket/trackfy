import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { summary, question } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
  }

  const prompt = `
    Você é um Engenheiro de Tráfego e Analista de Dados Sênior da TrackFY.
    Seu objetivo é ajudar o usuário a otimizar suas campanhas de Meta/Google Ads.
    
    DADOS ATUAIS (RESUMO):
    ${JSON.stringify(summary)}
    
    PERGUNTA DO USUÁRIO:
    "${question}"
    
    DIRETRIZES:
    - Responda em português de forma direta e profissional.
    - Máximo 2 parágrafos.
    - Dê sugestões práticas baseadas nos dados fornecidos.
    - Use voz ativa e tom de parceiro de negócios.
  `;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
        }
      })
    });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar sua solicitação.";

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
