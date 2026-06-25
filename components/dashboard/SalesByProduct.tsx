"use client";
import { useState, useEffect } from "react";
import { HelpCircle, BarChart2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { safeArray } from "@/lib/safeArray";
import { fmtCompact, fmtCurrency } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SalesByProduct() {
  const [mounted, setMounted] = useState(false);
  const { token, accountId, campaigns } = useAppStore();
  const isConnected = !!(token && accountId);
  const list = safeArray(campaigns);
  useEffect(() => setMounted(true), []);

  // Dados reais do gráfico baseados nas campanhas conectadas
  const hasData = isConnected && list.length > 0;

  // Gráfico de gasto por campanha (top 5)
  const chartData = hasData
    ? list
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5)
        .map((c) => ({ name: c.name.slice(0, 12) + (c.name.length > 12 ? "…" : ""), gasto: c.spend, conv: c.conversions }))
    : [];

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Gasto por Campanha</span>
        <HelpCircle className="w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2} />
      </div>

      {!isConnected || !hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
            <BarChart2 className="w-5 h-5" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)" }}>
            {!isConnected ? "Sem dados" : "Carregando..."}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-4)" }}>
            {!isConnected ? "Conecte uma conta" : "Sincronize para ver"}
          </p>
        </div>
      ) : (
        <>
          {mounted ? (
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--blue)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-4)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--text-4)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", fontSize: 12, boxShadow: "var(--shadow-xl)" }}
                    formatter={(v: number, name: string) => [name === "gasto" ? fmtCurrency(v) : v, name === "gasto" ? "Gasto" : "Conversões"]}
                  />
                  <Area type="monotone" dataKey="gasto" stroke="var(--blue)" strokeWidth={2} fill="url(#sg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />
          )}

          <div className="mt-3 space-y-2">
            {list.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-[11px] font-medium truncate" style={{ color: "var(--text-3)", maxWidth: "60%" }}>{c.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (c.spend / (list[0]?.spend || 1)) * 100)}%`, background: "var(--blue)" }} />
                  </div>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--text-3)" }}>{fmtCurrency(c.spend)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
