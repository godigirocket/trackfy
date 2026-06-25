"use client";
import { useState, useEffect } from "react";
import { HelpCircle, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const DAYS  = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);

function cellColor(v: number): string {
  if (v <= 0)   return "var(--border)";
  if (v < 0.15) return "rgba(37,99,235,0.08)";
  if (v < 0.3)  return "rgba(37,99,235,0.18)";
  if (v < 0.5)  return "rgba(37,99,235,0.32)";
  if (v < 0.7)  return "rgba(37,99,235,0.52)";
  if (v < 0.85) return "rgba(37,99,235,0.72)";
  return "rgba(37,99,235,0.92)";
}

export function HourlyHeatmap() {
  const [mounted, setMounted] = useState(false);
  const [tip, setTip]         = useState<{ day: string; hour: string; value: number } | null>(null);
  const { token, accountId, campaigns } = useAppStore();
  const isConnected = !!(token && accountId);

  useEffect(() => setMounted(true), []);

  // Gerar heatmap baseado em dados reais de campanhas (quando disponível)
  // Por enquanto, mostrar vazio quando não conectado
  const hasData = isConnected && campaigns.length > 0;

  // Heatmap vazio (zeros) — será preenchido com dados reais da API quando disponível
  const emptyData = DAYS.map(() => HOURS.map(() => 0));

  if (!mounted) return <div className="card h-48 animate-pulse" style={{ background: "var(--bg-muted)" }} />;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Picos de Horário</h2>
        <HelpCircle className="w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2} />
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
            <Clock className="w-6 h-6" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>Sem dados de horário</p>
            <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>Conecte sua conta Meta Ads para ver os picos de atividade</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              {/* Hour labels */}
              <div className="flex mb-1.5 ml-8">
                {HOURS.filter((_, i) => i % 4 === 0).map((h) => (
                  <div key={h} className="flex-1 text-center" style={{ fontSize: 9, color: "var(--text-4)", fontWeight: 600 }}>{h}</div>
                ))}
              </div>

              {/* Grid */}
              {DAYS.map((day, di) => (
                <div key={day} className="flex items-center gap-1 mb-0.5">
                  <span className="w-7 text-right shrink-0" style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600 }}>{day}</span>
                  <div className="flex gap-0.5 flex-1">
                    {HOURS.map((hour, hi) => (
                      <div
                        key={hour}
                        className="flex-1 h-4 rounded-sm cursor-pointer transition-opacity hover:opacity-70"
                        style={{ background: cellColor(emptyData[di][hi]) }}
                        onMouseEnter={() => setTip({ day, hour, value: emptyData[di][hi] })}
                        onMouseLeave={() => setTip(null)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3">
            <span style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600 }}>Menos</span>
            {[0, 0.2, 0.4, 0.6, 0.85].map((v, i) => (
              <div key={i} className="w-4 h-3 rounded-sm" style={{ background: cellColor(v) }} />
            ))}
            <span style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600 }}>Mais</span>
            {tip && (
              <span className="ml-auto text-[11px] font-medium" style={{ color: "var(--text-3)" }}>
                {tip.day} {tip.hour} — {tip.value > 0 ? `${(tip.value * 100).toFixed(0)}% atividade` : "sem dados"}
              </span>
            )}
          </div>

          {!hasData && (
            <p className="text-center mt-3" style={{ fontSize: 12, color: "var(--text-4)" }}>
              Sincronize para carregar os dados de horário
            </p>
          )}
        </>
      )}
    </div>
  );
}
