"use client";
import { useState } from "react";
import { Search, TrendingUp, TrendingDown, HelpCircle, ShoppingBag } from "lucide-react";
import { fmtCurrency, fmtPct, cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface ProductRow {
  id: string; name: string; vendas: number; faturamento: number;
  ticket: number; roas: number; conversao: number; status: "up" | "down" | "stable";
}

export function SalesTable() {
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState<keyof ProductRow>("faturamento");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { token, accountId }  = useAppStore();
  const isConnected = !!(token && accountId);

  // Sem dados mockados — só mostra dados reais quando conectado
  const data: ProductRow[] = [];

  const filtered = data
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortBy] as number, vb = b[sortBy] as number;
      return sortDir === "desc" ? vb - va : va - vb;
    });

  const handleSort = (col: keyof ProductRow) => {
    if (sortBy === col) setSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const cols: { key: keyof ProductRow; label: string }[] = [
    { key: "name", label: "Produto" }, { key: "vendas", label: "Vendas" },
    { key: "faturamento", label: "Faturamento" }, { key: "ticket", label: "Ticket" },
    { key: "roas", label: "ROAS" }, { key: "conversao", label: "Conv." },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Vendas por Produto</h2>
          <HelpCircle className="w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2} />
        </div>
        {isConnected && data.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2.5} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              className="input pl-8 py-1.5 text-[12px] w-40" />
          </div>
        )}
      </div>

      {!isConnected || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
            <ShoppingBag className="w-6 h-6" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>
              {!isConnected ? "Conta não conectada" : "Sem dados de vendas"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>
              {!isConnected
                ? "Conecte sua conta Meta Ads para ver as vendas por produto"
                : "Importe vendas via CSV em Despesas ou conecte sua plataforma de e-commerce"}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                {cols.map((col) => (
                  <th key={col.key}
                    onClick={() => col.key !== "name" && handleSort(col.key)}
                    className={cn("px-5 py-3 text-left whitespace-nowrap", col.key !== "name" && "cursor-pointer")}
                    style={{ color: sortBy === col.key ? "var(--blue)" : "var(--text-4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {col.label}{sortBy === col.key && <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>}
                  </th>
                ))}
                <th className="px-5 py-3 text-left" style={{ color: "var(--text-4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b transition-colors duration-100"
                  style={{ borderColor: "var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-5 py-3 text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{p.name}</td>
                  <td className="px-5 py-3 text-[13px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{p.vendas}</td>
                  <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCurrency(p.faturamento)}</td>
                  <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCurrency(p.ticket)}</td>
                  <td className="px-5 py-3 tabular-nums">
                    <span className="text-[13px] font-bold" style={{ color: p.roas >= 3 ? "var(--green)" : p.roas >= 2 ? "var(--yellow)" : "var(--red)" }}>
                      {p.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtPct(p.conversao)}</td>
                  <td className="px-5 py-3">
                    {p.status === "up"     && <TrendingUp   className="w-4 h-4" style={{ color: "var(--green)" }} strokeWidth={2.5} />}
                    {p.status === "down"   && <TrendingDown className="w-4 h-4" style={{ color: "var(--red)" }}   strokeWidth={2.5} />}
                    {p.status === "stable" && <span className="text-[13px] font-bold" style={{ color: "var(--text-4)" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t" style={{ background: "var(--bg-subtle)", borderColor: "var(--border-2)" }}>
                  <td className="px-5 py-3 text-[12px] font-bold" style={{ color: "var(--text-3)" }}>Total</td>
                  <td className="px-5 py-3 text-[13px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{filtered.reduce((s, p) => s + p.vendas, 0)}</td>
                  <td className="px-5 py-3 text-[13px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{fmtCurrency(filtered.reduce((s, p) => s + p.faturamento, 0))}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
