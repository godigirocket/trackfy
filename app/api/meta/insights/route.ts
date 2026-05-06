import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaign_id');

  // Return a mock successful response to prevent 404 errors in the UI
  return NextResponse.json({
    data: [
      {
        campaign_id: campaignId,
        spend: "0.00",
        cpm: "0.00",
        cpc: "0.00",
        ctr: "0.00",
        frequency: "1.0",
        date_start: new Date().toISOString().split('T')[0],
        date_stop: new Date().toISOString().split('T')[0]
      }
    ]
  });
}
