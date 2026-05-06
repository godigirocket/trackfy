"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  fetchMetaInsights, fetchHourlyInsights, fetchBreakdowns,
  fetchCreativesHD, fetchAccountStructure,
} from "@/services/metaApi";
import { readCache, writeCache, isCacheFresh } from "@/lib/syncCache";

let isFetching = false;
let lastFetchKey = "";
let lastForceTime = 0;
const FORCE_COOLDOWN_MS = 120_000; // 120s minimum between forced syncs

export function clearFetchCache() {
  lastFetchKey = "";
  isFetching = false;
}

function resolveTimeParams(period: string, customStart: string | null, customEnd: string | null) {
  if (period === "last_2d" || period === "last_3d") {
    const days = period === "last_2d" ? 2 : 3;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    return {
      period: "custom",
      customStart: start.toISOString().split("T")[0],
      customEnd: end.toISOString().split("T")[0],
    };
  }
  return { period, customStart, customEnd };
}

function loadFromCache(accountId: string, periodKey: string) {
  const store = useAppStore.getState();
  const dataA      = readCache(accountId, periodKey, "campaign");
  const dataAds    = readCache(accountId, periodKey, "ad");
  const hourlyA    = readCache(accountId, periodKey, "hourly");
  const breakdowns = readCache(accountId, periodKey, "breakdowns");
  const creatives  = readCache(accountId, periodKey, "creatives");
  const hierarchy  = readCache(accountId, periodKey, "hierarchy");

  if (dataA)      store.setDataA(dataA);
  if (dataAds)    store.setMetaAdsData(dataAds);
  if (hourlyA)    store.setHourlyDataA(hourlyA);
  if (breakdowns) {
    store.setAgeBreakdownA(breakdowns.age || []);
    store.setGenderBreakdownA(breakdowns.gender || []);
    store.setRegionBreakdownA(breakdowns.region || []);
  }
  if (creatives)  store.setCreativesHD(creatives);
  if (hierarchy)  store.setHierarchy(hierarchy);

  return !!(dataA || dataAds || hierarchy);
}

/** Sleep helper */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

let lastErrorTime = 0;
const SESSION_ERROR_COOLDOWN = 60_000; // 1 minute cooldown on session errors

export async function runRefresh(force = false) {
  const { token, accountId, period, customStart, customEnd, apiError } = useAppStore.getState();
  if (!token || !accountId) return;

  // If we had a session error recently, don't auto-retry unless forced
  if (!force && apiError?.includes("expirou") && (Date.now() - lastErrorTime < SESSION_ERROR_COOLDOWN)) {
    return;
  }

  // Hard rate limit on forced syncs
  if (force) {
    const now = Date.now();
    if (now - lastForceTime < FORCE_COOLDOWN_MS) {
      const wait = Math.ceil((FORCE_COOLDOWN_MS - (now - lastForceTime)) / 1000);
      useAppStore.getState().setApiError(`Aguarde ${wait}s antes de sincronizar novamente.`);
      setTimeout(() => useAppStore.getState().setApiError(null), 3000);
      return;
    }
    lastForceTime = now;
  }

  if (isFetching) return;

  const tp = resolveTimeParams(period, customStart, customEnd);
  const periodKey = tp.period === "custom" ? `${tp.customStart}_${tp.customEnd}` : tp.period;
  const key = `${token}|${accountId}|${periodKey}`;

  if (!force && key === lastFetchKey) return;

  // Always load cache first — instant display
  const hadCache = loadFromCache(accountId, periodKey);

  // Skip API if cache is fresh and not forced
  if (!force && hadCache && isCacheFresh(accountId, periodKey, "campaign")) {
    lastFetchKey = key;
    useAppStore.getState().setLastSync("cache");
    return;
  }

  console.log("[MetaAPI] Starting refresh...", { periodKey, force });
  isFetching = true;
  lastFetchKey = key;

  const store = useAppStore.getState();
  if (!hadCache) store.setLoading(true);
  // Only clear error if forced or if it's not a session error
  if (force || !apiError?.includes("expirou")) store.setApiError(null);

  try {
    const tp2 = { 
      period: tp.period, 
      customStart: tp.customStart || undefined, 
      customEnd: tp.customEnd || undefined 
    };

    // ── Step 1: Primary insights (campaign + ad) ──
    const campRes = await fetchMetaInsights(accountId, token, { ...tp2, level: "campaign" });
    await sleep(400);
    const adRes = await fetchMetaInsights(accountId, token, { ...tp2, level: "ad" });

    if (campRes.length > 0) {
      writeCache(accountId, periodKey, "campaign", campRes);
      useAppStore.getState().setDataA(campRes);
    }
    if (adRes.length > 0) {
      writeCache(accountId, periodKey, "ad", adRes);
      useAppStore.getState().setMetaAdsData(adRes);
    }

    // ── Step 2: Hierarchy ──
    await sleep(600);
    const hierRes = await fetchAccountStructure(accountId, token);
    if (hierRes) {
      useAppStore.getState().setHierarchy(hierRes as any);
      writeCache(accountId, periodKey, "hierarchy", hierRes);
    }

    // ── Step 3: Hourly data ──
    await sleep(600);
    const hourlyRes = await fetchHourlyInsights(accountId, token, tp2);
    if (hourlyRes.length > 0) {
      writeCache(accountId, periodKey, "hourly", hourlyRes);
      useAppStore.getState().setHourlyDataA(hourlyRes);
    }

    // ── Step 4: Creatives ──
    await sleep(800);
    const crRes = await fetchCreativesHD(accountId, token);
    if (crRes && Object.keys(crRes).length > 0) {
      useAppStore.getState().setCreativesHD(crRes);
      writeCache(accountId, periodKey, "creatives", crRes);
    }

    // ── Step 5: Breakdowns ──
    await sleep(400);
    const bdRes = await fetchBreakdowns(accountId, token, tp2);
    if (bdRes) {
      useAppStore.getState().setAgeBreakdownA(bdRes.age);
      useAppStore.getState().setGenderBreakdownA(bdRes.gender);
      useAppStore.getState().setRegionBreakdownA(bdRes.region);
      writeCache(accountId, periodKey, "breakdowns", bdRes);
    }

    useAppStore.getState().setLastSync(
      new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
    useAppStore.getState().setApiError(null);
  } catch (err: any) {
    console.error("[MetaAPI Refresh Error]", err);
    lastErrorTime = Date.now();
    
    let msg = err?.message || "Erro na API do Facebook";
    if (msg === "SESSION_EXPIRED") {
      msg = "Sessão do Meta Ads expirou. Por favor, atualize seu token nas configurações.";
    } else if (msg === "RATE_LIMIT") {
      msg = "Limite de requisições atingido na Meta. O sistema aguardará alguns minutos.";
      // Set a longer cooldown for rate limits
      lastErrorTime = Date.now() + 300000; // 5 extra minutes
    }
    
    useAppStore.getState().setApiError(msg);
  } finally {
    isFetching = false;
    useAppStore.getState().setLoading(false);
  }
}

export function useMetaData() {
  const token      = useAppStore(s => s.token);
  const accountId  = useAppStore(s => s.accountId);
  const period     = useAppStore(s => s.period);
  const customStart = useAppStore(s => s.customStart);
  const customEnd  = useAppStore(s => s.customEnd);

  useEffect(() => {
    if (!token || !accountId) return;
    // Clear any in-flight fetch lock so period/date changes always trigger a fresh load
    clearFetchCache();
    runRefresh();
  }, [token, accountId, period, customStart, customEnd]);

  return { refresh: () => runRefresh(true) };
}
