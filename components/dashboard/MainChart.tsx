"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { safeArray } from "@/lib/safeArray";
import { BarChart2 } from "lucide-react";

interface MainChartProps {
  data?: { day: string; invested: number; conversions: number }[];
}

export function MainChart({ data }: MainChartProps) {
  const [mounted, setMounted] = useState(false);
  const { campaigns, token, accountId } = useAppStore();
  useEffect(() => setMounted(true), []);

  const isConnected = !!(token && accountId);
  const list = safeArray(campaigns);

  // Usar dados reais das campanhas — sem mock
  // Quando conectado, mostrar dados reais; quando não, mostrar vazio
  const chartData = data ?? (isConnected && list.length > 0
    ? list.slice(0, 7).map((c, i) => ({
        day: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i] ?? `D${i + 1}`,
        invested: c.spend,
        conversions: c.conversions,
      }))
    : []);

  if (!mounted) {
    return <div className="h-64 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />;
  }

  if (!isConnected || chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3" style={{ background: "var(--bg-subtle)", borderRadius: "var(--r-xl)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
          <BarChart2 className="w-6 h-6" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>Sem dados de performance</p>
          <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>
            {!isConnected ? "Conecte sua conta Meta Ads para ver o gráfico" : "Sincronize para carregar os dados"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--text-4)", fontWeight: 500 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "var(--text-4)", fontWeight: 500 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-1)",
              boxShadow: "var(--shadow-xl)",
            }}
            labelStyle={{ color: "var(--text-3)", fontWeight: 700, marginBottom: 4 }}
            formatter={(v: number, name: string) => [
              name === "invested" ? `R$ ${v.toFixed(2)}` : v,
              name === "invested" ? "Investido" : "Conversões",
            ]}
          />
          <Legend
            formatter={(v) => (
              <span style={{ color: "var(--text-3)", fontSize: 12, fontWeight: 600 }}>
                {v === "invested" ? "Investido" : "Conversões"}
              </span>
            )}
          />
          <Line type="monotone" dataKey="invested" stroke="var(--blue)" strokeWidth={2} dot={{ fill: "var(--blue)", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="conversions" stroke="var(--green)" strokeWidth={2} dot={{ fill: "var(--green)", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
