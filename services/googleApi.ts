import { useAppStore } from "@/store/useAppStore";

// Mock implementation for Google Ads API with resilience
export async function fetchGoogleInsights(customerId: string, developerToken: string, accessToken: string) {
  // Simulate API call with backoff
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", name: "Search - Fundo de Funil", status: "ENABLED", budget: 15000, clicks: 1250, impressions: 8500, cost: 4500, conversions: 45, type: "SEARCH" },
        { id: "2", name: "PMax - Performance Max", status: "ENABLED", budget: 30000, clicks: 3400, impressions: 45000, cost: 12000, conversions: 112, type: "PERFORMANCE_MAX" },
      ]);
    }, 800);
  });
}

export async function createGoogleCampaign(data: any) {
  console.log("Creating Google Campaign:", data);
  return { id: "g_" + Math.random().toString(36).slice(2), ...data };
}

export async function fetchGoogleKeywords(campaignId: string) {
  return [
    { id: "k1", text: "marketing digital", status: "ENABLED", impressions: 1200, clicks: 45, conversions: 2 },
    { id: "k2", text: "gestão de tráfego", status: "ENABLED", impressions: 800, clicks: 32, conversions: 5 },
  ];
}
