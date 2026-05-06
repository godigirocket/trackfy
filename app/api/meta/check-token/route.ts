import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: { message: "Missing token", code: 400 } }, { status: 400 });
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${token}`);
    const data = await res.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 200 });
    }
    
    return NextResponse.json({ valid: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message, code: 500 } }, { status: 500 });
  }
}
