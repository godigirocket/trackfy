import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 1x1 transparent GIF pixel
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const event = {
    page: searchParams.get('page') || '',
    referrer: searchParams.get('ref') || '',
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_content: searchParams.get('utm_content') || '',
    utm_term: searchParams.get('utm_term') || '',
    device: searchParams.get('device') || 'unknown',
    fbclid: searchParams.get('fbclid') || '',
    gclid: searchParams.get('gclid') || '',
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '',
    user_agent: req.headers.get('user-agent') || '',
    created_at: new Date().toISOString(),
  };

  // Save to Supabase if available
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('tracking_events').insert([event]);
    } catch (_) {}
  }

  // Return 1x1 transparent pixel image
  return new Response(PIXEL_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event = {
      page: body.url || body.page || '',
      referrer: body.ref || body.referrer || '',
      utm_source: body.utm_source || body.src || '',
      utm_medium: body.utm_medium || '',
      utm_campaign: body.utm_campaign || body.cam || '',
      utm_content: body.utm_content || '',
      utm_term: body.utm_term || '',
      device: body.device || 'unknown',
      fbclid: body.fb || body.fbclid || '',
      gclid: body.gclid || '',
      session_id: body.sid || '',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || '',
      user_agent: req.headers.get('user-agent') || '',
      created_at: new Date().toISOString(),
    };

    const sb = getSupabase();
    if (sb) {
      await sb.from('tracking_events').insert([event]);
    }

    return NextResponse.json({ success: true }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
