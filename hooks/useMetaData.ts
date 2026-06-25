"use client";
import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { fetchCampaigns, fetchAdsets, fetchAds } from "@/lib/meta/api";

// Lock GLOBAL — fora do React, não reseta entre renders
let _isFetching = false;
let _lastKey = "";
let _abortController: AbortController | null = null;

/** Exportado para o Topbar usar sem instanciar o hook */
export async function runRefresh() {
  const { token, accountId, period, setLoading, setApiError, setCampaigns, setAdsets, setAds, setLastSync } =
    useAppStore.getState();

  if (!token || !accountId) {
    setApiError("Configure o Token Meta e o Account ID em Configurações.");
    return;
  }

  const key = `${token.slice(-8)}_${accountId}_${period}`;
  if (_isFetching || key === _lastKey) return; // já buscando ou mesmos parâmetros

  // Cancelar chamada anterior
  _abortController?.abort();
  _abortController = new AbortController();
  const signal = _abortController.signal;

  _isFetching = true;
  _lastKey = key;
  setLoading(true);
  setApiError(null);

  try {
    const [campaigns, adsets, ads] = await Promise.all([
      fetchCampaigns(accountId, token, period, signal),
      fetchAdsets(accountId, token, period, signal),
      fetchAds(accountId, token, period, signal),
    ]);

    if (!signal.aborted) {
      setCampaigns(campaigns);
      setAdsets(adsets);
      setAds(ads);
      setLastSync(new Date());
    }
  } catch (e: any) {
    if (!signal.aborted) {
      const msg = e?.message ?? "Erro ao buscar dados da Meta API.";
      setApiError(msg);
      console.error("[MetaAPI] Error:", e);
    }
  } finally {
    _isFetching = false;
    setLoading(false);
  }
}

/** Hook para usar dentro de componentes React */
export function useMetaData() {
  const refresh = useCallback(runRefresh, []);
  return { runRefresh: refresh };
}
