/**
 * Safely wraps a value in an array. 
 * If value is already an array, returns it.
 * If value is null or undefined, returns an empty array.
 * Useful for .map() calls on API responses that might be flaky.
 */
export function safeArray<T>(data: T | T[] | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}
