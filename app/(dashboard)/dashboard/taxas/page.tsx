"use client";
import { useState } from "react";
import { Plus, Trash2, Save, Percent, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Taxa {
  id: string;
  nome: string;
  tipo: "percentual" | "fixo";
  valor: number;
  aplicarEm: "faturamento" | "lucro" | "gasto";
  ativo: boolean;
}

const INITIAL: Taxa[] = [];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0"
      style={{
        background: checked ? "var(--blue)" : "var(--border-2)",
        width: 40, height: 22,
      }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white transition-all duration-200"
        style={{
          width: 18, height: 18,
          left: checked ? 20 : 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

export default function TaxasPage() {
  const [taxas, setTaxas] = useState<Taxa[]>(INITIAL);
  const [saved, setSaved] = useState(false);

  const add = () => setTaxas((t) => [...t, { id: crypto.randomUUID(), nome: "Nova Taxa", tipo: "percentual", valor: 0, aplicarEm: "faturamento", ativo: true }]);
  const remove = (id: string) => setTaxas((t) => t.filter((x) => x.id !== id));
  const update = (id: string, field: keyof Taxa, value: any) => setTaxas((t) => t.map((x) => x.id === id ? { ...x, [field]: value } : x));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const totalPct = taxas.filter((t) => t.ativo && t.tipo === "percentual").reduce((s, t) => s + t.valor, 0);
  const totalFixed = taxas.filter((t) => t.ativo && t.tipo === "fixo").reduce((s, t) => s + t.valor, 0);

  const selectStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    color: "var(--text-2)",
    fontSize: 13,
    fontWeight: 500,
    padding: "6px 10px",
    outline: "none",
    cursor: "pointer",
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    color: "var(--text-1)",
    fontSize: 13,
    fontWeight: 500,
    padding: "6px 10px",
    outline: "none",
    width: 80,
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Taxas</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>
            Configure impostos e taxas que incidem sobre suas vendas
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="btn-secondary px-4 py-2">
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Adicionar
          </button>
          <button onClick={save} className="btn-primary px-4 py-2">
            {saved ? <><CheckCircle className="w-4 h-4" strokeWidth={2.5} /> Salvo!</> : <><Save className="w-4 h-4" strokeWidth={2.5} /> Salvar</>}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total de Taxas",
            value: `${totalPct.toFixed(2)}%${totalFixed > 0 ? ` + R$ ${totalFixed.toFixed(2)}` : ""}`,
            color: "var(--yellow)",
            bg: "var(--yellow-light)",
            icon: Percent,
          },
          {
            label: "Taxas Ativas",
            value: taxas.filter((t) => t.ativo).length.toString(),
            color: "var(--green)",
            bg: "var(--green-light)",
            icon: CheckCircle,
          },
          {
            label: "Taxas Inativas",
            value: taxas.filter((t) => !t.ativo).length.toString(),
            color: "var(--text-4)",
            bg: "var(--bg-muted)",
            icon: Info,
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </span>
            </div>
            <p className="text-[22px] font-bold tracking-tight" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
          <div className="grid grid-cols-[1fr_120px_100px_140px_60px_40px] gap-4 items-center">
            {["Nome", "Tipo", "Valor", "Aplicar em", "Ativo", ""].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </span>
            ))}
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {taxas.map((t) => (
            <div
              key={t.id}
              className="px-5 py-3.5 grid grid-cols-[1fr_120px_100px_140px_60px_40px] gap-4 items-center transition-colors duration-100"
              style={{ opacity: t.ativo ? 1 : 0.5 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Nome */}
              <input
                value={t.nome}
                onChange={(e) => update(t.id, "nome", e.target.value)}
                className="bg-transparent focus:outline-none font-semibold"
                style={{ fontSize: 14, color: "var(--text-1)", border: "none" }}
                onFocus={(e) => { (e.target as HTMLElement).style.borderBottom = "2px solid var(--blue)"; }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderBottom = "none"; }}
              />

              {/* Tipo */}
              <select value={t.tipo} onChange={(e) => update(t.id, "tipo", e.target.value)} style={selectStyle}>
                <option value="percentual">Percentual</option>
                <option value="fixo">Fixo (R$)</option>
              </select>

              {/* Valor */}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={t.valor}
                  onChange={(e) => update(t.id, "valor", parseFloat(e.target.value) || 0)}
                  style={inputStyle}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-4)" }}>
                  {t.tipo === "percentual" ? "%" : "R$"}
                </span>
              </div>

              {/* Aplicar em */}
              <select value={t.aplicarEm} onChange={(e) => update(t.id, "aplicarEm", e.target.value)} style={selectStyle}>
                <option value="faturamento">Faturamento</option>
                <option value="lucro">Lucro</option>
                <option value="gasto">Gasto Ads</option>
              </select>

              {/* Toggle */}
              <Toggle checked={t.ativo} onChange={() => update(t.id, "ativo", !t.ativo)} />

              {/* Delete */}
              <button
                onClick={() => remove(t.id)}
                className="btn-icon w-8 h-8"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-4)")}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        {taxas.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p style={{ fontSize: 14, color: "var(--text-4)" }}>Nenhuma taxa configurada</p>
            <button onClick={add} className="btn-primary mt-3 px-4 py-2">
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Adicionar taxa
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "var(--blue-light)", border: "1px solid rgba(37,99,235,0.15)" }}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--blue)" }} strokeWidth={2} />
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          As taxas são aplicadas automaticamente no cálculo do lucro e margem no Dashboard.
          Taxas percentuais são calculadas sobre o valor selecionado em "Aplicar em".
        </p>
      </div>
    </div>
  );
}
