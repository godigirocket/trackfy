import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { fetchGoogleInsights, fetchGoogleKeywords } from "@/services/googleApi";
import { ImageIcon } from "lucide-react";

let fetchCache: Record<string, any> = {};

export function clearGoogleCache() {
  fetchCache = {};
}

export function useGoogleData() {
  const { token, googleCustomerId, setGoogleData, isLoading, setLoading, setApiError } = useAppStore();
  const lastFetch = useRef<string>("");

  const fetchData = async () => {
    if (!token || !googleCustomerId) return;
    
    const cacheKey = `${googleCustomerId}_${token}`;
    if (fetchCache[cacheKey]) {
      setGoogleData(fetchCache[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const insights = await fetchGoogleInsights(googleCustomerId, "mock_dev_token", token);
      const data = { campaigns: insights };
      fetchCache[cacheKey] = data;
      setGoogleData(data);
      setApiError(null);
    } catch (e: any) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [googleCustomerId, token]);

  return { refresh: fetchData };
}
