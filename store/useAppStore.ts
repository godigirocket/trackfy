import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AutomationRule {
  id: string;
  name: string;
  metric: string;
  operator: "gt" | "lt";
  value: number;
  action: "pause" | "notify" | "budget_down";
  enabled: boolean;
  lastRun?: string;
  target?: string;
}

interface AppState {
  // Navigation & UI
  period: string;
  setPeriod: (period: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  isDirectorMode: boolean;
  setIsDirectorMode: (val: boolean) => void;
  toggleDirectorMode: () => void;
  isCompare: boolean;
  setIsCompare: (val: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  
  // Date Range
  customStart: string | null;
  customEnd: string | null;
  setCustomRange: (start: string | null, end: string | null) => void;
  
  // Selection
  selectedCampaigns: string[];
  setSelectedCampaigns: (ids: string[]) => void;
  selectedAdSets: string[];
  setSelectedAdSets: (ids: string[]) => void;
  selectedAds: string[];
  setSelectedAds: (ids: string[]) => void;
  
  // Filters
  statusFilters: string[];
  setStatusFilters: (filters: string[]) => void;
  objectiveFilters: string[];
  setObjectiveFilters: (filters: string[]) => void;
  placementFilters: string[];
  setPlacementFilters: (filters: string[]) => void;
  
  // Tokens & Config
  metaToken: string | null;
  setMetaToken: (token: string | null) => void;
  googleToken: string | null;
  setGoogleToken: (token: string | null) => void;
  token: string | null; // Google generic token
  setToken: (token: string | null) => void;
  googleCustomerId: string | null;
  setGoogleCustomerId: (id: string | null) => void;
  accountId: string | null;
  setAccountId: (id: string | null) => void;
  geminiKey: string | null;
  setGeminiKey: (key: string | null) => void;
  
  // Data
  metaData: any[];
  setMetaData: (data: any[]) => void;
  metaAdsData: any[];
  setMetaAdsData: (data: any[]) => void;
  googleData: any;
  setGoogleData: (data: any) => void;
  hierarchy: any;
  setHierarchy: (hierarchy: any) => void;
  ageBreakdownA: any[];
  setAgeBreakdownA: (data: any[]) => void;
  genderBreakdownA: any[];
  setGenderBreakdownA: (data: any[]) => void;
  regionBreakdownA: any[];
  setRegionBreakdownA: (data: any[]) => void;
  
  // Status
  isLoading: boolean;
  setLoading: (val: boolean) => void;
  apiError: string | null;
  setApiError: (err: string | null) => void;
  
  // Hourly Data
  hourlyDataA: any[];
  setHourlyDataA: (data: any[]) => void;
  hourlyDataB: any[];
  setHourlyDataB: (data: any[]) => void;
  
  // CRM
  crmLeads: any[];
  setCRMLeads: (leads: any[]) => void;
  updateCRMLead: (id: string, data: any) => void;
  
  // Backward compatibility
  dataA: any[];
  dataB: any[];
  setDataA: (data: any[]) => void;
  setDataB: (data: any[]) => void;
  annotations: any[];
  setAnnotations: (data: any[]) => void;
  
  // App specific state
  setDrawerCampaignId: (id: string | null) => void;
  drawerCampaignId: string | null;
  creativesHD: Record<string, string>;
  setCreativesHD: (data: Record<string, string>) => void;
  lastSync: string | null;
  setLastSync: (time: string | null) => void;

  runRefresh: () => void;
  _hydrate: () => void;
  
  // Automation Rules
  automationRules: AutomationRule[];
  addRule: (rule: AutomationRule) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  period: "last_7d",
  setPeriod: (period) => set({ period }),
  userName: "juam",
  setUserName: (userName) => set({ userName }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  statusFilter: "all",
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  isDirectorMode: false,
  setIsDirectorMode: (isDirectorMode) => set({ isDirectorMode }),
  toggleDirectorMode: () => set((state) => ({ isDirectorMode: !state.isDirectorMode })),
  isCompare: false,
  setIsCompare: (isCompare) => set({ isCompare }),
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  userEmail: null,
  setUserEmail: (userEmail) => set({ userEmail }),
  
  customStart: null,
  customEnd: null,
  setCustomRange: (customStart, customEnd) => set({ customStart, customEnd }),
  
  selectedCampaigns: [],
  setSelectedCampaigns: (selectedCampaigns) => set({ selectedCampaigns }),
  selectedAdSets: [],
  setSelectedAdSets: (selectedAdSets) => set({ selectedAdSets }),
  selectedAds: [],
  setSelectedAds: (selectedAds) => set({ selectedAds }),
  
  statusFilters: [],
  setStatusFilters: (statusFilters) => set({ statusFilters }),
  objectiveFilters: [],
  setObjectiveFilters: (objectiveFilters) => set({ objectiveFilters }),
  placementFilters: [],
  setPlacementFilters: (placementFilters) => set({ placementFilters }),
  
  metaToken: null,
  setMetaToken: (metaToken) => set({ metaToken }),
  googleToken: null,
  setGoogleToken: (googleToken) => set({ googleToken }),
  token: null,
  setToken: (token) => set({ token }),
  googleCustomerId: null,
  setGoogleCustomerId: (googleCustomerId) => set({ googleCustomerId }),
  accountId: null,
  setAccountId: (accountId) => set({ accountId }),
  geminiKey: null,
  setGeminiKey: (geminiKey) => set({ geminiKey }),
  
  metaData: [],
  setMetaData: (metaData) => set({ metaData }),
  metaAdsData: [],
  setMetaAdsData: (metaAdsData) => set({ metaAdsData }),
  googleData: [],
  setGoogleData: (googleData) => set({ googleData }),
  hierarchy: null,
  setHierarchy: (hierarchy) => set({ hierarchy }),
  ageBreakdownA: [],
  setAgeBreakdownA: (ageBreakdownA) => set({ ageBreakdownA }),
  genderBreakdownA: [],
  setGenderBreakdownA: (genderBreakdownA) => set({ genderBreakdownA }),
  regionBreakdownA: [],
  setRegionBreakdownA: (regionBreakdownA) => set({ regionBreakdownA }),
  
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
  apiError: null,
  setApiError: (apiError) => set({ apiError }),
  
  hourlyDataA: [],
  setHourlyDataA: (hourlyDataA) => set({ hourlyDataA }),
  hourlyDataB: [],
  setHourlyDataB: (hourlyDataB) => set({ hourlyDataB }),
  
  crmLeads: [],
  setCRMLeads: (crmLeads) => set({ crmLeads }),
  updateCRMLead: (id, data) => set((state) => ({
    crmLeads: state.crmLeads.map((l) => (l.id === id ? { ...l, ...data } : l))
  })),
  
  dataA: [],
  dataB: [],
  setDataA: (dataA) => set({ dataA }),
  setDataB: (dataB) => set({ dataB }),
  annotations: [],
  setAnnotations: (annotations) => set({ annotations }),
  
  drawerCampaignId: null,
  setDrawerCampaignId: (drawerCampaignId) => set({ drawerCampaignId }),
  creativesHD: {},
  setCreativesHD: (creativesHD) => set({ creativesHD }),

  lastSync: null,
  setLastSync: (lastSync) => set({ lastSync }),

  runRefresh: () => {
    console.log("Sincronizando dados...");
  },

  _hydrate: () => {
    console.log("Hydrating store...");
  },

  automationRules: [],
  addRule: (rule) => set((state) => ({ automationRules: [...state.automationRules, rule] })),
  removeRule: (id) => set((state) => ({ automationRules: state.automationRules.filter((r) => r.id !== id) })),
  toggleRule: (id) => set((state) => ({
    automationRules: state.automationRules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r)
  }))
}),
{
  name: "trackfy-storage",
  partialize: (state) => ({ 
    automationRules: state.automationRules, 
    theme: state.theme,
    metaToken: state.metaToken,
    googleToken: state.googleToken,
    accountId: state.accountId
  })
}
));
