/** Garante que qualquer valor seja sempre um array — nunca quebra .map() */
export function safeArray<T>(v: T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : [];
}

/** Garante que um número nunca seja NaN/Infinity */
export function safeNum(v: number | null | undefined, fallback = 0): number {
  if (v === null || v === undefined || isNaN(v) || !isFinite(v)) return fallback;
  return v;
}
