"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Power, Pencil, Copy, Trash2, Search, Plus, MoreHorizontal, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtCurrency, fmtPct, fmtCompact } from "@/lib/utils";
import type { MetricRow, CampaignStatus } from "@/store/useAppStore";
import { useAppStore } from "@/store/useAppStore";
import { updateCampaignStatus } from "@/lib/meta/api";
import { safeArray } from "@/lib/safeArray";

const STATUS_LABEL: Record<CampaignStatus, string> = {
  ACTIVE: "Ativa", PAUSED: "Pausada", ARCHIVED: "Arquivada", DELETED: "Excluída",
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const styles: Record<CampaignStatus, { bg: string; color: string }> = {
    ACTIVE:   { bg: "var(--green-light)",  color: "var(--green)" },
    PAUSED:   { bg: "var(--bg-muted)",     color: "var(--text-3)" },
    ARCHIVED: { bg: "var(--bg-muted)",     color: "var(--text-4)" },
    DELETED:  { bg: "var(--red-light)",    color: "var(--red)" },
  };
  const s = styles[status];
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {status === "ACTIVE" && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--green)" }} />}
      {STATUS_LABEL[status]}
    </span>
  );
}

function EditableCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  if (editing) {
    return (
      <input autoFocus value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { setEditing(false); onSave(val); }}
        onKeyDown={(e) => { if (e.key === "Enter") { setEditing(false); onSave(val); } if (e.key === "Escape") setEditing(false); }}
        className="input text-[13px] py-1 w-full" />
    );
  }
  return (
    <span onDoubleClick={() => setEditing(true)}
      className="cursor-pointer transition-colors duration-100 font-medium"
      style={{ color: "var(--text-1)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--blue)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-1)")}
      title="Duplo clique para editar">
      {value}
    </span>
  );
}

function TableRow({ row, children = [], depth = 0 }: { row: MetricRow; children?: MetricRow[]; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const { token, setCampaigns, campaigns } = useAppStore();

  const toggleStatus = async () => {
    const next = row.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    if (token) { try { await updateCampaignStatus(row.id, next, token); } catch { } }
    setCampaigns(campaigns.map((c) => c.id === row.id ? { ...c, status: next } : c));
  };

  return (
    <>
      <tr className="border-b group transition-colors duration-100"
        style={{ borderColor: "var(--border)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        <td className="px-4 py-3 min-w-[220px]">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 18 }}>
            {children.length > 0 ? (
              <button onClick={() => setExpanded(!expanded)}
                className="btn-icon w-5 h-5 shrink-0">
                {expanded ? <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} /> : <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />}
              </button>
            ) : <span className="w-5" />}
            {row.thumbnailUrl && <img src={row.thumbnailUrl} alt="" className="w-6 h-6 rounded-md object-cover shrink-0" />}
            <EditableCell value={row.name} onSave={(v) => setCampaigns(campaigns.map((c) => c.id === row.id ? { ...c, name: v } : c))} />
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={row.status} /></td>
        <td className="px-4 py-3 text-right text-[13px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{fmtCompact(row.conversions)}</td>
        <td className="px-4 py-3 text-right text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCurrency(row.cpl)}</td>
        <td className="px-4 py-3 text-right text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCurrency(row.budget)}</td>
        <td className="px-4 py-3 text-right text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtCurrency(row.spend)}</td>
        <td className="px-4 py-3 text-right text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{fmtPct(row.ctr)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button onClick={toggleStatus} className="btn-icon w-7 h-7"
              style={{ color: row.status === "ACTIVE" ? "var(--green)" : "var(--text-4)" }}>
              <Power className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            <button className="btn-icon w-7 h-7"><Pencil className="w-3.5 h-3.5" strokeWidth={2} /></button>
            <button className="btn-icon w-7 h-7"><Copy className="w-3.5 h-3.5" strokeWidth={2} /></button>
            <button className="btn-icon w-7 h-7"
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-4)")}>
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && children.map((child) => <TableRow key={child.id} row={child} depth={depth + 1} />)}
    </>
  );
}

export function CampaignsTable({ campaigns, adsets, ads }: { campaigns: MetricRow[]; adsets: MetricRow[]; ads: MetricRow[] }) {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CampaignStatus>("ALL");

  const filtered = safeArray(campaigns).filter((c) => {
    return c.name.toLowerCase().includes(search.toLowerCase()) && (statusFilter === "ALL" || c.status === statusFilter);
  });

  const getAdsets = (id: string) => safeArray(adsets).filter((a) => a.parentId === id);

  const HEADERS = ["Nome", "Status", "Conversões", "CPL", "Orçamento", "Gasto", "CTR", "Ações"];
  const RIGHT   = ["Conversões", "CPL", "Orçamento", "Gasto", "CTR"];

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b flex-wrap" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="btn-primary px-3.5 py-2">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Criar
          </button>
          {[{ icon: Copy, label: "Duplicar" }, { icon: Pencil, label: "Editar" }, { icon: FlaskConical, label: "Teste A/B" }].map(({ icon: Icon, label }) => (
            <button key={label} className="btn-secondary px-3.5 py-2">
              <Icon className="w-3.5 h-3.5" strokeWidth={2} /> {label}
            </button>
          ))}
          <button className="btn-ghost px-2.5 py-2">
            <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-4)" }} strokeWidth={2.5} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar campanha..."
              className="input pl-8 py-1.5 text-[12px] w-44" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
            className="select py-1.5 text-[12px] w-28">
            <option value="ALL">Todos</option>
            <option value="ACTIVE">Ativas</option>
            <option value="PAUSED">Pausadas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
              {HEADERS.map((h) => (
                <th key={h}
                  className={cn("px-4 py-3 whitespace-nowrap", RIGHT.includes(h) ? "text-right" : "text-left")}
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-4)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-[13px] font-medium" style={{ color: "var(--text-4)" }}>
                  {campaigns.length === 0
                    ? "Configure o Token Meta e Account ID em Configurações para carregar campanhas."
                    : "Nenhuma campanha encontrada."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => <TableRow key={c.id} row={c} children={getAdsets(c.id)} />)
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-4 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)" }}>
            {filtered.length} campanha{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
