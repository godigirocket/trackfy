"use client";
import { useState, useCallback } from "react";
import { Upload, DollarSign, TrendingUp, ShoppingBag, BarChart2, X, FileText, AlertCircle } from "lucide-react";
import { fmtCurrency } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { safeArray } from "@/lib/safeArray";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface OrderRow { date: string; product: string; value: number; cost: number; channel: string; utm_campaign: string; }

export default function FinancePage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const { campaigns } = useAppStore();

  const totalSpend   = safeArray(campaigns).reduce((s, c) => s + c.spend, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.value, 0);
  const totalCost    = orders.reduce((s, o) => s + o.cost, 0);
  const profit       = totalRevenue - totalCost - totalSpend;
  const roas         = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) { setError("CSV inválido ou vazio."); return; }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s/g, "_"));
    const rows: OrderRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",");
      const row: any = {};
      headers.forEach((h, idx) => { row[h] = vals[idx]?.trim() ?? ""; });
      rows.push({ date: row.data ?? row.date ?? "", product: row.produto ?? row.product ?? "", value: parseFloat(row.valor ?? row.value ?? "0"), cost: parseFloat(row.custo ?? row.cost ?? "0"), channel: row.canal ?? row.channel ?? "", utm_campaign: row.utm_campaign ?? "" });
    }
    setOrders(rows); setError("");
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) { setError("Apenas arquivos .csv são aceitos."); return; }
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const chartData = Object.entries(
    orders.reduce((acc, o) => {
      acc[o.date] = acc[o.date] ?? { date: o.date, revenue: 0, cost: 0 };
      acc[o.date].revenue += o.value; acc[o.date].cost += o.cost;
      return acc;
    }, {} as Record<string, { date: string; revenue: number; cost: number }>)
  ).map(([, v]) => v).slice(-14);

  const kpis = [
    { label: "Receita Bruta",      value: fmtCurrency(totalRevenue), icon: DollarSign,  color: "var(--green)" },
    { label: "Investimento Meta",  value: fmtCurrency(totalSpend),   icon: BarChart2,   color: "var(--blue)" },
    { label: "Lucro Estimado",     value: fmtCurrency(profit),       icon: TrendingUp,  color: profit >= 0 ? "var(--green)" : "var(--red)" },
    { label: "ROAS",               value: `${roas.toFixed(2)}x`,     icon: ShoppingBag, color: "var(--text-1)" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Financeiro</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>Analise receita, custos e ROAS das suas campanhas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}>
                <k.icon className="w-3.5 h-3.5" style={{ color: k.color }} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</span>
            </div>
            <p className="text-[22px] font-bold tracking-tight" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Upload */}
      <div className="card p-5">
        <h2 className="text-[14px] font-bold mb-1" style={{ color: "var(--text-1)" }}>Upload de Vendas (CSV)</h2>
        <p className="text-[12px] mb-4" style={{ color: "var(--text-4)" }}>
          Colunas esperadas: <code className="px-1.5 py-0.5 rounded-md font-mono text-[11px]" style={{ background: "var(--bg-muted)", color: "var(--text-2)" }}>data, produto, valor, custo, canal, utm_campaign</code>
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="border-2 border-dashed rounded-xl p-10 text-center transition-all duration-150 cursor-pointer"
          style={{ borderColor: dragging ? "var(--blue)" : "var(--border)", background: dragging ? "var(--blue-light)" : "var(--bg-subtle)" }}
        >
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: dragging ? "var(--blue)" : "var(--text-4)" }} strokeWidth={1.5} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Arraste um arquivo CSV ou</p>
          <label className="btn-primary mt-3 cursor-pointer inline-flex">
            Selecionar arquivo
            <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl text-[12px]"
            style={{ background: "var(--red-light)", border: "1px solid rgba(220,38,38,0.15)", color: "var(--red)" }}>
            <X className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} /> {error}
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-5">
          <h2 className="text-[14px] font-bold mb-4" style={{ color: "var(--text-1)" }}>Receita vs Custo por Dia</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-4)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-4)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", fontSize: 12, boxShadow: "var(--shadow-xl)" }} formatter={(v: number) => fmtCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                <Bar dataKey="revenue" name="Receita" fill="var(--green)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost"    name="Custo"   fill="var(--blue)"  radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Orders table */}
      {orders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: "var(--text-4)" }} strokeWidth={2} />
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Pedidos ({orders.length})</h2>
            </div>
            <button onClick={() => setOrders([])} className="btn-ghost text-[12px]" style={{ color: "var(--red)" }}>
              <X className="w-3.5 h-3.5" strokeWidth={2.5} /> Limpar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                  {["Data", "Produto", "Valor", "Custo", "Canal", "Campanha UTM"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 100).map((o, i) => (
                  <tr key={i} className="border-b transition-colors duration-100" style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-3)" }}>{o.date}</td>
                    <td className="px-5 py-3 text-[13px] font-medium max-w-[200px] truncate" style={{ color: "var(--text-1)" }}>{o.product}</td>
                    <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--green)" }}>{fmtCurrency(o.value)}</td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-3)" }}>{fmtCurrency(o.cost)}</td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-3)" }}>{o.channel}</td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-4)" }}>{o.utm_campaign}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length > 100 && (
              <p className="px-5 py-3 text-[12px]" style={{ color: "var(--text-4)" }}>Mostrando 100 de {orders.length} pedidos</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
