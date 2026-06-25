import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const GRAPH_VERSION = "v22.0";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    token,
    phoneNumberId,
    to,
    mode = "text",
    text,
    templateName,
    templateLanguage = "pt_BR",
  } = body as Record<string, string>;

  if (!token) return NextResponse.json({ error: "WhatsApp token required" }, { status: 401 });
  if (!phoneNumberId) return NextResponse.json({ error: "Phone Number ID required" }, { status: 400 });
  if (!to) return NextResponse.json({ error: "Recipient phone required" }, { status: 400 });

  const payload = mode === "template"
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName || "hello_world",
          language: { code: templateLanguage },
        },
      }
    : {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text || "" },
      };

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "WhatsApp request failed" }, { status: 500 });
  }
}
