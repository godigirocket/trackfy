"use client";
import { create } from "zustand";

export type PeriodFilter =
  | "hoje" | "ontem" | "esta_semana" | "semana_passada"
  | "7d" | "14d" | "30d" | "60d" | "90d"
  | "mes" | "mes_passado" | "trimestre" | "ano" | "ano_passado" | "custom";

export type TrafficSource = "todos" | "meta" | "google" | "tiktok" | "kwai" | "organico";
export type Platform = "todas" | "desktop" | "mobile" | "tablet";

interface FilterState {
  period: PeriodFilter;
  adAccount: string;
  trafficSource: TrafficSource;
  platform: Platform;
  product: string;
  customStart: string;
  customEnd: string;

  setPeriod: (p: PeriodFilter) => void;
  setAdAccount: (a: string) => void;
  setTrafficSource: (s: TrafficSource) => void;
  setPlatform: (p: Platform) => void;
  setProduct: (p: string) => void;
  setCustomRange: (start: string, end: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  period: "hoje",
  adAccount: "qualquer",
  trafficSource: "todos",
  platform: "todas",
  product: "qualquer",
  customStart: "",
  customEnd: "",

  setPeriod:       (p) => set({ period: p }),
  setAdAccount:    (a) => set({ adAccount: a }),
  setTrafficSource:(s) => set({ trafficSource: s }),
  setPlatform:     (p) => set({ platform: p }),
  setProduct:      (p) => set({ product: p }),
  setCustomRange:  (start, end) => set({ customStart: start, customEnd: end }),
}));

export const PERIOD_OPTIONS: { value: PeriodFilter; label: string; group: string }[] = [
  { value: "hoje",          label: "Hoje",              group: "Rápido" },
  { value: "ontem",         label: "Ontem",             group: "Rápido" },
  { value: "esta_semana",   label: "Esta semana",       group: "Semana" },
  { value: "semana_passada",label: "Semana passada",    group: "Semana" },
  { value: "7d",            label: "Últimos 7 dias",    group: "Dias" },
  { value: "14d",           label: "Últimos 14 dias",   group: "Dias" },
  { value: "30d",           label: "Últimos 30 dias",   group: "Dias" },
  { value: "60d",           label: "Últimos 60 dias",   group: "Dias" },
  { value: "90d",           label: "Últimos 90 dias",   group: "Dias" },
  { value: "mes",           label: "Este mês",          group: "Mês" },
  { value: "mes_passado",   label: "Mês passado",       group: "Mês" },
  { value: "trimestre",     label: "Este trimestre",    group: "Mês" },
  { value: "ano",           label: "Este ano",          group: "Ano" },
  { value: "ano_passado",   label: "Ano passado",       group: "Ano" },
  { value: "custom",        label: "Personalizado",     group: "Outro" },
];

export const PERIOD_MULTIPLIERS: Record<PeriodFilter, number> = {
  hoje: 1, ontem: 0.95, esta_semana: 5, semana_passada: 7,
  "7d": 7, "14d": 14, "30d": 30, "60d": 60, "90d": 90,
  mes: 28, mes_passado: 30, trimestre: 90, ano: 365, ano_passado: 365, custom: 1,
};
