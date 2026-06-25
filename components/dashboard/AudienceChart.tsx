"use client";
import { useState, useEffect } from "react";
import { HelpCircle, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export function AudienceChart() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab]         = useState<"idade" | "genero" | "dispositivo">("idade");
  const { token, accountId }  = useAppStore();
  const isConnected = !!(token && accountId);
  useEffect(() => setMounted(true), []);

  const tabs = [
    { id: "idade",       label: "Idade" },
    { id: "genero",      label: "Gênero" },
    { id: "dispositivo", label: "Dispositivo" },
  ] as const;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Audiência & Canais</h2>
        <HelpCircle className="w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2} />
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
            <Users className="w-6 h-6" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>Sem dados de audiência</p>
            <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>Conecte sua conta para ver o breakdown de audiência</p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-0.5 mb-4 p-0.5 rounded-lg w-fit" style={{ background: "var(--bg-muted)" }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-100"
                style={{
                  background: tab === t.id ? "var(--surface)" : "transparent",
                  color: tab === t.id ? "var(--text-1)" : "var(--text-4)",
                  boxShadow: tab === t.id ? "var(--shadow-xs)" : "none",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Empty state — dados reais virão da API */}
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)" }}>Dados de {tab} não disponíveis</p>
            <p style={{ fontSize: 12, color: "var(--text-4)" }}>
              O breakdown de audiência requer permissões avançadas da Meta API.
              <br />Sincronize para tentar carregar os dados.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
