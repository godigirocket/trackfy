const APP_ID = process.env.META_APP_ID;
const APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/meta/auth`;

export function getMetaAuthUrl() {
  const scope = [
    "ads_management",
    "ads_read",
    "read_insights",
    "business_management",
  ].join(",");
  
  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&response_type=code`;
}

export async function exchangeCodeForToken(code: string) {
  const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${APP_SECRET}&code=${code}`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.error) throw new Error(data.error.message);
  
  // Exchange for long-lived token
  const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${data.access_token}`;
  
  const longRes = await fetch(longLivedUrl);
  const longData = await longRes.json();
  
  if (longData.error) throw new Error(longData.error.message);
  
  return longData;
}
