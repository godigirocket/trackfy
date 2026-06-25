"use client";
import { create } from "zustand";
import type { Period } from "@/lib/constants";

export type CampaignStatus = "ACTIVE" | "PAUSED" | "ARCHIVED" | "DELETED";

export interface MetricRow {
  id: string;
  name: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpl: number;
  roas: number;
  budget: number;
  budgetType: "daily" | "lifetime";
  objective?: string;
  level: "campaign" | "adset" | "ad";
  parentId?: string;
  thumbnailUrl?: string;
  format?: string;
}

interface AppState {
  // Auth / config
  token: string;
  accountId: string;
  setToken: (t: string) => void;
  setAccountId: (id: string) => void;

  // Period
  period: Period;
  setPeriod: (p: Period) => void;

  // Data
  campaigns: MetricRow[];
  adsets: MetricRow[];
  ads: MetricRow[];
  isLoading: boolean;
  apiError: string | null;
  lastSync: Date | null;

  setCampaigns: (c: MetricRow[]) => void;
  setAdsets: (a: MetricRow[]) => void;
  setAds: (a: MetricRow[]) => void;
  setLoading: (v: boolean) => void;
  setApiError: (e: string | null) => void;
  setLastSync: (d: Date) => void;

  // Hydration
  _hydrated: boolean;
  _hydrate: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  token: "",
  accountId: "",
  period: "7D",
  campaigns: [],
  adsets: [],
  ads: [],
  isLoading: false,
  apiError: null,
  lastSync: null,
  _hydrated: false,

  setToken: (t) => {
    if (typeof window !== "undefined") localStorage.setItem("tf_token", t);
    set({ token: t });
  },
  setAccountId: (id) => {
    if (typeof window !== "undefined") localStorage.setItem("tf_account", id);
    set({ accountId: id });
  },
  setPeriod: (p) => set({ period: p }),
  setCampaigns: (c) => set({ campaigns: c }),
  setAdsets: (a) => set({ adsets: a }),
  setAds: (a) => set({ ads: a }),
  setLoading: (v) => set({ isLoading: v }),
  setApiError: (e) => set({ apiError: e }),
  setLastSync: (d) => set({ lastSync: d }),

  _hydrate: () => {
    if (get()._hydrated) return;
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("tf_token") ?? "";
    const accountId = localStorage.getItem("tf_account") ?? "";
    set({ token, accountId, _hydrated: true });
  },
}));
