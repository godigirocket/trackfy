export type TrafficChannel = "paid" | "organic" | "referral" | "direct" | "unknown";

const SEARCH_ENGINES = ["google.", "bing.", "yahoo.", "duckduckgo.", "search.brave.", "ecosia."];
const SOCIAL_NETWORKS = ["facebook.", "instagram.", "tiktok.", "linkedin.", "youtube.", "pinterest.", "x.com", "twitter."];

export function classifyTraffic(input: { source?: string | null; medium?: string | null; referrer?: string | null }) {
  const source = (input.source ?? "").toLowerCase();
  const medium = (input.medium ?? "").toLowerCase();
  const referrer = (input.referrer ?? "").toLowerCase();
  const value = `${source} ${medium} ${referrer}`;

  if (/(cpc|ppc|paid|paid_social|display|banner|affiliate)/.test(value)) return "paid" as const;
  if (source === "organic" || medium === "organic" || SEARCH_ENGINES.some((domain) => referrer.includes(domain) || source.includes(domain))) return "organic" as const;
  if (referrer || SOCIAL_NETWORKS.some((domain) => value.includes(domain))) return "referral" as const;
  if (source === "direct" || (!source && !referrer)) return "direct" as const;
  return "unknown" as const;
}

export function sourceLabel(channel: TrafficChannel) {
  return {
    paid: "Pago",
    organic: "Orgânico",
    referral: "Referência",
    direct: "Direto",
    unknown: "Sem classificação",
  }[channel];
}
