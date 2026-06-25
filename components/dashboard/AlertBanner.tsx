"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function AlertBanner() {
  const campaigns = useAppStore((state) => state.campaigns);
  const [dismissed, setDismissed] = useState(false);
  const pausedCount = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "PAUSED").length,
    [campaigns]
  );

  if (!pausedCount || dismissed) return null;

  return (
    <div className="space-y-2">
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: "var(--yellow-light)", border: "1px solid rgba(217,119,6,0.15)" }}
      >
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--yellow)" }} strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: "var(--yellow)" }}>{pausedCount} campanha{pausedCount > 1 ? "s" : ""} pausada{pausedCount > 1 ? "s" : ""}</p>
          <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "var(--text-3)" }}>
            Isso é status real das campanhas sincronizadas, não um bloqueio da sua conta Trackfy.
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="btn-icon w-6 h-6" style={{ color: "var(--text-4)" }} aria-label="Fechar aviso">
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
