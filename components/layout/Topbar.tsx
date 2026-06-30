"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, Menu, Moon, RefreshCw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { runRefresh } from "@/hooks/useMetaData";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useFilterStore, type PeriodFilter } from "@/store/useFilterStore";

const DATE_PRESETS: Array<{ group: string; items: Array<{ label: string; value: PeriodFilter }> }> = [
  { group: "Rápido", items: [{ label: "Hoje", value: "hoje" }, { label: "Ontem", value: "ontem" }] },
  { group: "Semana", items: [{ label: "Esta semana", value: "esta_semana" }, { label: "Semana passada", value: "semana_passada" }, { label: "Últimos 7 dias", value: "7d" }] },
  { group: "Mês", items: [{ label: "Este mês", value: "mes" }, { label: "Mês passado", value: "mes_passado" }, { label: "Últimos 30 dias", value: "30d" }, { label: "Últimos 90 dias", value: "90d" }] },
  { group: "Ano", items: [{ label: "Este ano", value: "ano" }, { label: "Ano passado", value: "ano_passado" }] },
  { group: "Outro", items: [{ label: "Personalizado", value: "custom" }] },
];

const LABELS: Record<PeriodFilter, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  esta_semana: "Esta semana",
  semana_passada: "Semana passada",
  "7d": "7 dias",
  "14d": "14 dias",
  "30d": "30 dias",
  "60d": "60 dias",
  "90d": "90 dias",
  mes: "Este mês",
  mes_passado: "Mês passado",
  trimestre: "Trimestre",
  ano: "Este ano",
  ano_passado: "Ano passado",
  custom: "Personalizado",
};

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { isLoading } = useAppStore();
  const { period, setPeriod, customStart, customEnd, setCustomRange } = useFilterStore();
  const [mounted, setMounted] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(customStart);
  const [draftEnd, setDraftEnd] = useState(customEnd);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(event.target as Node)) setDateOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDark = resolvedTheme !== "light";
  const displayLabel = period === "custom" && customStart && customEnd ? `${customStart} → ${customEnd}` : LABELS[period];

  const choosePeriod = (value: PeriodFilter) => {
    setPeriod(value);
    if (value !== "custom") setDateOpen(false);
    runRefresh();
  };

  return (
    <header
      className="h-[56px] shrink-0 flex items-center justify-between gap-2 px-3 md:px-5 border-b"
      style={{
        background: "var(--overlay)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderColor: "var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button type="button" onClick={onMenuClick} className="btn-icon md:hidden shrink-0" aria-label="Abrir menu">
          <Menu className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </button>

        <div className="relative min-w-0" ref={dropRef}>
          <button
            type="button"
            onClick={() => setDateOpen((value) => !value)}
            className="flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] font-semibold transition-all duration-150 max-w-[148px] sm:max-w-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              padding: "6px 10px",
              color: "var(--text-2)",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
            <span className="truncate" style={{ color: "var(--text-1)" }}>{displayLabel}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 transition-transform duration-200", dateOpen && "rotate-180")} style={{ color: "var(--text-4)" }} strokeWidth={2.5} />
          </button>

          {dateOpen && (
            <div
              className="fixed left-3 right-3 top-[64px] z-50 overflow-hidden sm:absolute sm:left-0 sm:right-auto sm:top-[calc(100%+8px)] sm:w-64"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-xl)",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              <div className="p-2 max-h-[70vh] overflow-y-auto">
                {DATE_PRESETS.map((group) => (
                  <div key={group.group} className="mb-1">
                    <p className="section-label py-1.5">{group.group}</p>
                    {group.items.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => choosePeriod(item.value)}
                        className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-100"
                        style={{
                          background: period === item.value ? "var(--blue-muted)" : "transparent",
                          color: period === item.value ? "var(--blue)" : "var(--text-2)",
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {period === "custom" && (
                <div className="border-t p-3 space-y-2.5" style={{ borderColor: "var(--border)" }}>
                  <p className="section-label">Período personalizado</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold mb-1 block" style={{ color: "var(--text-4)" }}>De</label>
                      <input type="date" value={draftStart} onChange={(event) => setDraftStart(event.target.value)} className="input text-[12px] py-1.5" style={{ colorScheme: isDark ? "dark" : "light" }} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold mb-1 block" style={{ color: "var(--text-4)" }}>Até</label>
                      <input type="date" value={draftEnd} onChange={(event) => setDraftEnd(event.target.value)} className="input text-[12px] py-1.5" style={{ colorScheme: isDark ? "dark" : "light" }} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCustomRange(draftStart, draftEnd); setDateOpen(false); runRefresh(); }}
                    disabled={!draftStart || !draftEnd}
                    className="btn-primary w-full py-1.5 text-[12px]"
                  >
                    Aplicar período
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {mounted && (
          <span className="text-[12px] font-medium hidden lg:block mr-2" style={{ color: "var(--text-4)" }}>
            {format(new Date(), "EEE, d MMM yyyy", { locale: ptBR })}
          </span>
        )}
        <button onClick={runRefresh} disabled={isLoading} className="btn-icon hidden sm:flex" title="Sincronizar">
          <RefreshCw className={cn("w-[15px] h-[15px]", isLoading && "animate-spin")} strokeWidth={2.5} />
        </button>
        <NotificationBell />
        {mounted && (
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className="btn-icon" title={isDark ? "Modo claro" : "Modo escuro"}>
            {isDark ? <Sun className="w-[15px] h-[15px]" strokeWidth={2.5} /> : <Moon className="w-[15px] h-[15px]" strokeWidth={2.5} />}
          </button>
        )}
      </div>
    </header>
  );
}
