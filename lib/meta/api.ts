import { META_GRAPH_URL } from "@/lib/constants";
import type { MetricRow, CampaignStatus } from "@/store/useAppStore";
import type { Period } from "@/lib/constants";

const TIMEOUT_MS = 25_000;

function periodToDateRange(period: Period): { since: string; until: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const sub = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d;
  };
  switch (period) {
    case "HOJE":   return { since: fmt(today), until: fmt(today) };
    case "ONTEM":  return { since: fmt(sub(1)), until: fmt(sub(1)) };
    case "7D":     return { since: fmt(sub(7)), until: fmt(today) };
    case "30D":    return { since: fmt(sub(30)), until: fmt(today) };
    case "MAX":    return { since: "2020-01-01", until: fmt(today) };
  }
}

async function metaFetch(url: string, signal?: AbortSignal): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const effectiveSignal = signal ?? controller.signal;

  let lastError: Error = new Error("Unknown error");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: effectiveSignal });
      clearTimeout(timeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      lastError = e as Error;
      if (effectiveSignal.aborted) throw lastError;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

function mapStatus(s: string): CampaignStatus {
  if (s === "ACTIVE") return "ACTIVE";
  if (s === "PAUSED") return "PAUSED";
  if (s === "ARCHIVED") return "ARCHIVED";
  return "DELETED";
}

export async function fetchCampaigns(
  accountId: string,
  token: string,
  period: Period,
  signal?: AbortSignal
): Promise<MetricRow[]> {
  const { since, until } = periodToDateRange(period);
  const fields = [
    "id", "name", "status", "objective",
    "daily_budget", "lifetime_budget",
    "insights.date_preset(last_7d){spend,impressions,clicks,actions,cost_per_action_type,ctr}",
  ].join(",");

  const url = `${META_GRAPH_URL}/act_${accountId}/campaigns?fields=${fields}&time_range={"since":"${since}","until":"${until}"}&access_token=${token}&limit=100`;
  const data = await metaFetch(url, signal);

  return (data.data ?? []).map((c: any): MetricRow => {
    const ins = c.insights?.data?.[0] ?? {};
    const spend = parseFloat(ins.spend ?? "0");
    const impressions = parseInt(ins.impressions ?? "0");
    const clicks = parseInt(ins.clicks ?? "0");
    const convs = (ins.actions ?? []).find((a: any) =>
      ["purchase", "lead", "complete_registration"].includes(a.action_type)
    );
    const conversions = parseInt(convs?.value ?? "0");
    const cpl = conversions > 0 ? spend / conversions : 0;
    const ctr = parseFloat(ins.ctr ?? "0");
    const budget = parseFloat(c.daily_budget ?? c.lifetime_budget ?? "0") / 100;

    return {
      id: c.id,
      name: c.name,
      status: mapStatus(c.status),
      spend,
      impressions,
      clicks,
      conversions,
      ctr,
      cpl,
      roas: 0,
      budget,
      budgetType: c.daily_budget ? "daily" : "lifetime",
      objective: c.objective,
      level: "campaign",
    };
  });
}

export async function fetchAdsets(
  accountId: string,
  token: string,
  period: Period,
  signal?: AbortSignal
): Promise<MetricRow[]> {
  const { since, until } = periodToDateRange(period);
  const fields = [
    "id", "name", "status", "campaign_id",
    "daily_budget", "lifetime_budget",
    "insights.date_preset(last_7d){spend,impressions,clicks,actions,ctr}",
  ].join(",");

  const url = `${META_GRAPH_URL}/act_${accountId}/adsets?fields=${fields}&time_range={"since":"${since}","until":"${until}"}&access_token=${token}&limit=200`;
  const data = await metaFetch(url, signal);

  return (data.data ?? []).map((a: any): MetricRow => {
    const ins = a.insights?.data?.[0] ?? {};
    const spend = parseFloat(ins.spend ?? "0");
    const conversions = parseInt(
      (ins.actions ?? []).find((x: any) =>
        ["purchase", "lead"].includes(x.action_type)
      )?.value ?? "0"
    );
    return {
      id: a.id,
      name: a.name,
      status: mapStatus(a.status),
      spend,
      impressions: parseInt(ins.impressions ?? "0"),
      clicks: parseInt(ins.clicks ?? "0"),
      conversions,
      ctr: parseFloat(ins.ctr ?? "0"),
      cpl: conversions > 0 ? spend / conversions : 0,
      roas: 0,
      budget: parseFloat(a.daily_budget ?? a.lifetime_budget ?? "0") / 100,
      budgetType: a.daily_budget ? "daily" : "lifetime",
      level: "adset",
      parentId: a.campaign_id,
    };
  });
}

export async function fetchAds(
  accountId: string,
  token: string,
  period: Period,
  signal?: AbortSignal
): Promise<MetricRow[]> {
  const { since, until } = periodToDateRange(period);
  const fields = [
    "id", "name", "status", "adset_id",
    "creative{thumbnail_url,image_url,object_type}",
    "insights.date_preset(last_7d){spend,impressions,clicks,actions,ctr}",
  ].join(",");

  const url = `${META_GRAPH_URL}/act_${accountId}/ads?fields=${fields}&time_range={"since":"${since}","until":"${until}"}&access_token=${token}&limit=200`;
  const data = await metaFetch(url, signal);

  return (data.data ?? []).map((a: any): MetricRow => {
    const ins = a.insights?.data?.[0] ?? {};
    const spend = parseFloat(ins.spend ?? "0");
    const conversions = parseInt(
      (ins.actions ?? []).find((x: any) =>
        ["purchase", "lead"].includes(x.action_type)
      )?.value ?? "0"
    );
    return {
      id: a.id,
      name: a.name,
      status: mapStatus(a.status),
      spend,
      impressions: parseInt(ins.impressions ?? "0"),
      clicks: parseInt(ins.clicks ?? "0"),
      conversions,
      ctr: parseFloat(ins.ctr ?? "0"),
      cpl: conversions > 0 ? spend / conversions : 0,
      roas: 0,
      budget: 0,
      budgetType: "daily",
      level: "ad",
      parentId: a.adset_id,
      thumbnailUrl: a.creative?.thumbnail_url ?? a.creative?.image_url,
      format: a.creative?.object_type,
    };
  });
}

export async function updateCampaignStatus(
  campaignId: string,
  status: "ACTIVE" | "PAUSED",
  token: string
): Promise<void> {
  const url = `${META_GRAPH_URL}/${campaignId}?status=${status}&access_token=${token}`;
  await metaFetch(url + "&method=POST");
}

export async function updateCampaignBudget(
  campaignId: string,
  budget: number,
  budgetType: "daily" | "lifetime",
  token: string
): Promise<void> {
  const field = budgetType === "daily" ? "daily_budget" : "lifetime_budget";
  const url = `${META_GRAPH_URL}/${campaignId}?${field}=${Math.round(budget * 100)}&access_token=${token}`;
  await metaFetch(url + "&method=POST");
}
