"use client";
import { useState } from "react";
import { Plus, Zap, Power, Trash2, Clock, CheckCircle, Info } from "lucide-react";

interface Rule {
  id: string; name: string; description: string; enabled: boolean;
  lastRun: string | null; actionsCount: number;
  actions: { type: string; value?: number }[];
}

const INITIAL: Rule[] = [];

const ACTION_LABELS: Record<string, string> = {
  pause: "Pausar", increase_budget: "Escalar orçamento", decrease_budget: "Reduzir orçamento", send_alert: "Enviar alerta",
};

const METRICS   = ["ctr", "cpl", "roas", "frequency", "spend", "conversions"];
const OPERATORS = [">", "<", ">=", "<=", "=="];
const ACTION_TYPES = [
  { value: "pause",           label: "Pausar campanha" },
  { value: "increase_budget", label: "Aumentar orçamento (%)" },
  { value: "decrease_budget", label: "Reduzir orçamento (%)" },
  { value: "send_alert",      label: "Enviar alerta" },
];

export default function RulesPage() {
  const [rules, setRules]     = useState<Rule[]>(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ name: "", description: "", metric: "ctr", operator: "<", value: "0.5", duration: "48", actionType: "pause", actionValue: "20" });

  const toggle = (id: string) => setRules((r) => r.map((rule) => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  const remove = (id: string) => setRules((r) => r.filter((rule) => rule.id !== id));

  const addRule = () => {
    if (!form.name) return;
    setRules((r) => [...r, {
      id: crypto.randomUUID(), name: form.name, description: form.description,
      enabled: true, lastRun: null, actionsCount: 0,
      actions: [{ type: form.actionType, value: form.actionType !== "pause" && form.actionType !== "send_alert" ? parseFloat(form.actionValue) : undefined }],
    }]);
    setShowForm(false);
    setForm({ name: "", description: "", metric: "ctr", operator: "<", value: "0.5", duration: "48", actionType: "pause", actionValue: "20" });
  };

  const selectStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", color: "var(--text-2)", fontSize: 13, fontWeight: 500, padding: "6px 10px", outline: "none" };

  return (
    <div className="max-w-[900px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Automações</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>Regras automáticas para otimizar suas campanhas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nova regra
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 space-y-4" style={{ borderColor: "rgba(37,99,235,0.3)" }}>
          <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Criar nova regra</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nome *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Pausar CTR baixo" className="input" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Descrição</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descreva a regra" className="input" />
            </div>
          </div>

          <div>
            <p className="mb-2" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Condição</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>Se</span>
              <select value={form.metric}   onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))}   style={selectStyle}>{METRICS.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}</select>
              <select value={form.operator} onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))} style={selectStyle}>{OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
              <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="input w-20 py-1.5" />
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>por</span>
              <input type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className="input w-16 py-1.5" />
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>horas</span>
            </div>
          </div>

          <div>
            <p className="mb-2" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ação</p>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={form.actionType} onChange={(e) => setForm((f) => ({ ...f, actionType: e.target.value }))} style={selectStyle}>
                {ACTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              {(form.actionType === "increase_budget" || form.actionType === "decrease_budget") && (
                <>
                  <input type="number" value={form.actionValue} onChange={(e) => setForm((f) => ({ ...f, actionValue: e.target.value }))} className="input w-16 py-1.5" />
                  <span style={{ fontSize: 13, color: "var(--text-3)" }}>%</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={addRule} disabled={!form.name} className="btn-primary px-4 py-2">Criar regra</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2">Cancelar</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="card p-4" style={{ opacity: rule.enabled ? 1 : 0.6 }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: rule.enabled ? "var(--blue-muted)" : "var(--bg-muted)" }}>
                  <Zap className="w-4 h-4" style={{ color: rule.enabled ? "var(--blue)" : "var(--text-4)" }} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{rule.name}</p>
                  <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>{rule.description}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {rule.lastRun ? (
                      <span className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--text-4)" }}>
                        <Clock className="w-3 h-3" strokeWidth={2} /> {rule.lastRun}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-4)" }}>Nunca executada</span>
                    )}
                    {rule.actionsCount > 0 && (
                      <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600, color: "var(--green)" }}>
                        <CheckCircle className="w-3 h-3" strokeWidth={2} /> {rule.actionsCount} ação{rule.actionsCount !== 1 ? "ões" : ""}
                      </span>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {rule.actions.map((a, i) => (
                        <span key={i} className="badge badge-blue">
                          {ACTION_LABELS[a.type] ?? a.type}{a.value ? ` ${a.value}%` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggle(rule.id)} className="btn-icon w-8 h-8"
                  style={{ color: rule.enabled ? "var(--green)" : "var(--text-4)" }}>
                  <Power className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <button onClick={() => remove(rule.id)} className="btn-icon w-8 h-8"
                  style={{ color: "var(--text-4)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-4)")}>
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="card p-12 text-center">
          <Zap className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--border-2)" }} strokeWidth={1.5} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>Nenhuma regra criada</p>
          <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>Crie regras para automatizar a gestão das suas campanhas</p>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "var(--blue-light)", border: "1px solid rgba(37,99,235,0.15)" }}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--blue)" }} strokeWidth={2} />
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          As regras são verificadas a cada hora. Para execução em tempo real, conecte sua conta Meta Ads nas Configurações.
        </p>
      </div>
    </div>
  );
}
