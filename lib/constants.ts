// Configuração Supabase: prioriza variáveis de ambiente NEXT_PUBLIC_*,
// com fallback para o projeto padrão. Permite ao usuário trocar de projeto
// apenas editando o .env.local.
export const SUPABASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://kmpitmrenyoowpglbuva.supabase.co";

export const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  "sb_publishable_-slVXb9S7v7sQWU3xUsrZQ_upjiBxmk";

export const META_GRAPH_URL = "https://graph.facebook.com/v19.0";

export const LEVELS = [
  { name: "INICIANTE", min: 0,       max: 1_000 },
  { name: "BRONZE",    min: 1_000,   max: 5_000 },
  { name: "PRATA",     min: 5_000,   max: 15_000 },
  { name: "OURO",      min: 15_000,  max: 50_000 },
  { name: "PLATINA",   min: 50_000,  max: 100_000 },
  { name: "ELITE",     min: 100_000, max: Infinity },
];

export const PERIODS = ["HOJE", "ONTEM", "7D", "30D", "MAX"] as const;
export type Period = (typeof PERIODS)[number];
