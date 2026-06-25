import type { Period } from "@/lib/constants";
import type { CampaignStatus, MetricRow } from "@/store/useAppStore";

const TIMEOUT_MS = 25_000;

export interface GoogleAdsCredentials {
  connectionId: string;
  userId: string;
}

function periodToDateRange(period: Period): { since: string; until: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const sub = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d;
  };

  switch (period) {
    case "HOJE": return { since: fmt(today), until: fmt(today) };
    case "ONTEM": return { since: fmt(sub(1)), until: fmt(sub(1)) };
    case "7D": return { since: fmt(sub(7)), until: fmt(today) };
    case "30D": return { since: fmt(sub(30)), until: fmt(today) };
    case "MAX": return { since: "2020-01-01", until: fmt(today) };
  }
}

function mapStatus(status: string): CampaignStatus {
  if (status === "ENABLED") return "ACTIVE";
  if (status === "PAUSED") return "PAUSED";
  if (status === "REMOVED") return "DELETED";
  return "ARCHIVED";
}

function microsToCurrency(value: string | number | undefined): number {
  return Number(value ?? 0) / 1_000_000;
}

async function googleAdsSearch(
  credentials: GoogleAdsCredentials,
  query: string,
  signal?: AbortSignal
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("/api/google-ads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-trackfy-user-id": credentials.userId,
      },
      body: JSON.stringify({ connectionId: credentials.connectionId, query }),
      signal: signal ?? controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
    return data.results ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchGoogleCampaigns(
  credentials: GoogleAdsCredentials,
  period: Period,
  signal?: AbortSignal
): Promise<MetricRow[]> {
  const { since, until } = periodToDateRange(period);
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.ctr
    FROM campaign
    WHERE segments.date BETWEEN '${since}' AND '${until}'
    ORDER BY metrics.cost_micros DESC
    LIMIT 100
  `;

  const rows = await googleAdsSearch(credentials, query, signal);

  return rows.map((row: any): MetricRow => {
    const campaign = row.campaign ?? {};
    const metrics = row.metrics ?? {};
    const budget = row.campaignBudget ?? {};
    const spend = microsToCurrency(metrics.costMicros);
    const conversions = Number(metrics.conversions ?? 0);

    return {
      id: String(campaign.id ?? ""),
      name: campaign.name ?? "Campanha sem nome",
      status: mapStatus(campaign.status ?? ""),
      spend,
      impressions: Number(metrics.impressions ?? 0),
      clicks: Number(metrics.clicks ?? 0),
      conversions,
      ctr: Number(metrics.ctr ?? 0) * 100,
      cpl: conversions > 0 ? spend / conversions : 0,
      roas: 0,
      budget: microsToCurrency(budget.amountMicros),
      budgetType: "daily",
      objective: campaign.advertisingChannelType,
      level: "campaign",
    };
  });
}
