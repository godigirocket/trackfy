const BASE = "https://graph.facebook.com/v19.0";
const PROXY = "/api/meta";

async function metaRequest(url: string, method = "GET", payload?: any, attempt = 0): Promise<any> {
  const res = await fetch(PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, method, payload }),
  });

  const json = await res.json();
  if (json.error) {
    const code = json.error.code;
    const isTransient = json.error.is_transient || [500, 504, 1, 2, 17].includes(code);

    if (isTransient && attempt < 3) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
      return metaRequest(url, method, payload, attempt + 1);
    }
    throw json.error;
  }
  return json;
}

export async function fetchWithPagination(url: string, limit = 500) {
  let allData: any[] = [];
  let nextUrl: string | null = url.includes("limit=") ? url : `${url}${url.includes("?") ? "&" : "?"}limit=${limit}`;

  while (nextUrl) {
    const res = await metaRequest(nextUrl);
    allData = [...allData, ...(res.data || [])];
    nextUrl = res.paging?.next || null;
  }
  return allData;
}

export async function fetchMetaCampaigns(accountId: string, token: string) {
  const url = `${BASE}/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${token}`;
  return fetchWithPagination(url);
}

export async function fetchMetaAdSets(campaignId: string, token: string) {
  const url = `${BASE}/${campaignId}/adsets?fields=id,name,status,daily_budget,lifetime_budget,billing_event,bid_amount&access_token=${token}`;
  return fetchWithPagination(url);
}

export async function fetchMetaAds(adsetId: string, token: string) {
  const url = `${BASE}/${adsetId}/ads?fields=id,name,status,creative{id,thumbnail_url}&access_token=${token}`;
  return fetchWithPagination(url);
}

export async function updateCampaignStatus(id: string, status: string, token: string) {
  const url = `${BASE}/${id}`;
  return metaRequest(url, "POST", { status, access_token: token });
}
