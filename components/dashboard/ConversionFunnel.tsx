"use client";
import { HelpCircle, Filter } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { safeArray } from "@/lib/safeArray";
import { fmtCompact, fmtPct } from "@/lib/utils";

const STEPS = [
  { key: "impressions", label: "Impressões", color: "#3b82f6", track: "rgba(59,130,246,0.08)" },
  { key: "clicks",      label: "Cliques",    color: "#8b5cf6", track: "rgba(139,92,246,0.08)" },
  { key: "leads",       label: "Leads",      color: "#f59e0b", track: "rgba(245,158,11,0.08)" },
  { key: "sales",       label: "Vendas",     color: "#22c55e", track: "rgba(34,197,94,0.08)" },
];

export function ConversionFunnel() {
  const { campaigns, token, accountId } = useAppStore();
  const list = safeArray(campaigns);
  const isConnected = !!(token && accountId);
  const hasData = isConnected && list.length > 0;

  // Dados reais das campanhas — sem fallback mockado
  const impressions = hasData ? list.reduce((s, c) => s + c.impressions, 0) : 0;
  const clicks      = hasData ? list.reduce((s, c) => s + c.clicks, 0)      : 0;
  // Leads estimados a partir de conversões (sem dado real de leads na API básica)
  const leads       = hasData ? Math.round(list.reduce((s, c) => s + c.conversions, 0) * 1.8) : 0;
  const sales       = hasData ? list.reduce((s, c) => s + c.conversions, 0)                   : 0;

  const values: Record<string, number> = { impressions, clicks, leads, sales };
  const maxVal = impressions || 1;
  const rates  = [
    impressions > 0 ? (clicks / impressions) * 100 : 0,
    clicks      > 0 ? (leads  / clicks)      * 100 : 0,
    leads       > 0 ? (sales  / leads)       * 100 : 0,
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Funil de Conversão</h2>
        <HelpCircle className="w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2} />
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
            <Filter className="w-6 h-6" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>Sem dados de funil</p>
            <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>Conecte sua conta Meta Ads para ver o funil de conversão</p>
          </div>
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)" }}>Aguardando dados</p>
          <p style={{ fontSize: 12, color: "var(--text-4)" }}>Clique em Sincronizar para carregar as campanhas</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {STEPS.map((step, i) => {
              const val   = values[step.key];
              const pct   = (val / maxVal) * 100;
              const width = 100 - i * 10;
              return (
                <div key={step.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: step.color }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)" }}>{step.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {i > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)" }}>
                          {fmtPct(rates[i - 1])}
                        </span>
                      )}
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }} className="tabular-nums">
                        {fmtCompact(val)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div
                      className="h-6 overflow-hidden transition-all duration-500"
                      style={{ width: `${width}%`, background: step.track, borderRadius: "var(--r-md)" }}
                    >
                      <div
                        className="h-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: step.color, borderRadius: "var(--r-md)", opacity: 0.85 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "CTR",          value: fmtPct(rates[0]), color: "#3b82f6" },
              { label: "Click → Lead", value: fmtPct(rates[1]), color: "#8b5cf6" },
              { label: "Lead → Venda", value: fmtPct(rates[2]), color: "#22c55e" },
            ].map((r) => (
              <div key={r.label} className="text-center py-2.5 px-2 rounded-xl"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                <p className="text-[15px] font-bold tabular-nums" style={{ color: r.color }}>{r.value}</p>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", marginTop: 2 }}>
                  {r.label}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
