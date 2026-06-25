"use client";
import { useState } from "react";
import { Download, FileText, BarChart2, TrendingUp, Users, ShoppingBag, CheckCircle, Calendar } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { safeArray } from "@/lib/safeArray";
import { fmtCurrency } from "@/lib/utils";

const TEMPLATES = [
  { id: "performance", name: "Performance Geral",    icon: BarChart2,   desc: "Investimento, ROAS, CPL e conversões por período" },
  { id: "campanhas",   name: "Campanhas Detalhado",  icon: TrendingUp,  desc: "Métricas completas por campanha, conjunto e anúncio" },
  { id: "audiencia",   name: "Análise de Audiência", icon: Users,       desc: "Breakdown por idade, gênero, dispositivo e região" },
  { id: "produtos",    name: "Vendas por Produto",   icon: ShoppingBag, desc: "Faturamento, ticket médio e ROAS por produto" },
];

export default function RelatoriosPage() {
  const { campaigns } = useAppStore();
  const list = safeArray(campaigns);
  const [selected, setSelected] = useState<string[]>([]);
  const [format, setFormat]     = useState<"csv" | "pdf">("csv");
  const [period, setPeriod]     = useState("30d");
  const [generating, setGenerating] = useState(false);
  const [done, setDone]         = useState(false);

  const toggle = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const generate = async () => {
    if (selected.length === 0) return;
    setGenerating(true);
    if (format === "csv") {
      const headers = "Campanha,Status,Conversões,CPL,Orçamento,Gasto,CTR\n";
      const rows = list.map((c) => `"${c.name}",${c.status},${c.conversions},${c.cpl.toFixed(2)},${c.budget.toFixed(2)},${c.spend.toFixed(2)},${c.ctr.toFixed(2)}%`).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `trackfy_${new Date().toISOString().split("T")[0]}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
    setTimeout(() => { setGenerating(false); setDone(true); setTimeout(() => setDone(false), 3000); }, 1200);
  };

  const PERIOD_OPTIONS = [
    { value: "hoje", label: "Hoje" }, { value: "7d", label: "7 dias" },
    { value: "30d", label: "30 dias" }, { value: "90d", label: "90 dias" },
    { value: "mes", label: "Este mês" }, { value: "ano", label: "Este ano" },
  ];

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Relatórios</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>Exporte dados e gere relatórios personalizados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Campanhas",   value: list.length.toString() },
          { label: "Gasto Total", value: fmtCurrency(list.reduce((s, c) => s + c.spend, 0)) },
          { label: "Conversões",  value: list.reduce((s, c) => s + c.conversions, 0).toString() },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p className="text-[22px] font-bold mt-1 tracking-tight" style={{ color: "var(--text-1)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Templates */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Selecione os relatórios</h2>
          {TEMPLATES.map((t) => {
            const isSelected = selected.includes(t.id);
            return (
              <div
                key={t.id}
                onClick={() => toggle(t.id)}
                className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150"
                style={{
                  background: isSelected ? "var(--blue-light)" : "var(--surface)",
                  borderColor: isSelected ? "rgba(37,99,235,0.25)" : "var(--border)",
                  boxShadow: isSelected ? "0 0 0 1px rgba(37,99,235,0.15)" : "var(--shadow-xs)",
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: isSelected ? "var(--blue-muted)" : "var(--bg-muted)" }}
                >
                  <t.icon className="w-4.5 h-4.5" style={{ color: isSelected ? "var(--blue)" : "var(--text-4)" }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-4)", marginTop: 2 }}>{t.desc}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150"
                  style={{ background: isSelected ? "var(--blue)" : "transparent", borderColor: isSelected ? "var(--blue)" : "var(--border-2)" }}
                >
                  {isSelected && <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Config */}
        <div className="space-y-4">
          <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Configurações</h2>

          <div className="card p-4 space-y-4">
            {/* Format */}
            <div>
              <label className="block mb-2" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Formato</label>
              <div className="grid grid-cols-2 gap-2">
                {(["csv", "pdf"] as const).map((f) => (
                  <button key={f} onClick={() => setFormat(f)}
                    className="py-2 rounded-lg text-[13px] font-bold uppercase transition-all duration-150"
                    style={{
                      background: format === f ? "var(--blue)" : "var(--bg-muted)",
                      color: format === f ? "#fff" : "var(--text-3)",
                      border: `1px solid ${format === f ? "var(--blue)" : "var(--border)"}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="block mb-2" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Período</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2} />
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select pl-8">
                  {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={selected.length === 0 || generating}
              className="btn-primary w-full py-2.5"
            >
              {done
                ? <><CheckCircle className="w-4 h-4" strokeWidth={2.5} /> Exportado!</>
                : generating
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gerando...</>
                  : <><Download className="w-4 h-4" strokeWidth={2.5} /> Exportar {format.toUpperCase()}</>}
            </button>

            {selected.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--text-4)", textAlign: "center" }}>Selecione ao menos um relatório</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
