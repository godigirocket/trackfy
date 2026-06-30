"use client";
import { useState, useEffect, useRef } from "react";
import { RefreshCw, Sun, Moon, ChevronDown, Calendar, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppStore } from "@/store/useAppStore";
import { runRefresh } from "@/hooks/useMetaData";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

const DATE_PRESETS = [
  { group: "Rápido",  items: [{ label: "Hoje", value: "hoje" }, { label: "Ontem", value: "ontem" }, { label: "Anteontem", value: "anteontem" }] },
  { group: "Semana",  items: [{ label: "Esta semana", value: "esta_semana" }, { label: "Semana passada", value: "semana_passada" }, { label: "Últimos 7 dias", value: "7d" }] },
  { group: "Mês",     items: [{ label: "Este mês", value: "mes" }, { label: "Mês passado", value: "mes_passado" }, { label: "Últimos 30 dias", value: "30d" }, { label: "Últimos 60 dias", value: "60d" }, { label: "Últimos 90 dias", value: "90d" }] },
  { group: "Ano",     items: [{ label: "Este ano", value: "ano" }, { label: "Ano passado", value: "ano_passado" }] },
  { group: "Outro",   items: [{ label: "Máximo", value: "max" }, { label: "Personalizado", value: "custom" }] },
];

const LABELS: Record<string, string> = {
  hoje: "Hoje", ontem: "Ontem", anteontem: "Anteontem",
  esta_semana: "Esta semana", semana_passada: "Semana passada", "7d": "7 dias",
  mes: "Este mês", mes_passado: "Mês passado", "30d": "30 dias", "60d": "60 dias", "90d": "90 dias",
  ano: "Este ano", ano_passado: "Ano passado", max: "Máximo", custom: "Personalizado",
};

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { isLoading }               = useAppStore();
  const [mounted, setMounted]       = useState(false);
  const [dateOpen, setDateOpen]     = useState(false);
  const [selected, setSelected]     = useState("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd]   = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDateOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isDark = resolvedTheme !== "light";
  const displayLabel = selected === "custom" && customStart && customEnd
    ? `${customStart} → ${customEnd}`
    : LABELS[selected] ?? selected;

  return (
    <header
      className="h-[56px] shrink-0 flex items-center justify-between px-3 md:px-5 border-b"
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
      {/* Left — date picker */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={onMenuClick} className="btn-icon md:hidden" aria-label="Abrir menu">
          <Menu className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </button>
        <div className="relative hidden sm:block" ref={dropRef}>
        <button
          onClick={() => setDateOpen(!dateOpen)}
          className="flex items-center gap-2 text-[13px] font-semibold transition-all duration-150"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "6px 12px",
            color: "var(--text-2)",
            boxShadow: "var(--shadow-xs)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
        >
          <Calendar className="w-3.5 h-3.5" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
          <span style={{ color: "var(--text-1)" }}>{displayLabel}</span>
          <ChevronDown
            className={cn("w-3.5 h-3.5 transition-transform duration-200", dateOpen && "rotate-180")}
            style={{ color: "var(--text-4)" }}
            strokeWidth={2.5}
          />
        </button>

        {dateOpen && (
          <div
            className="absolute left-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div className="p-2 max-h-72 overflow-y-auto">
              {DATE_PRESETS.map((group) => (
                <div key={group.group} className="mb-1">
                  <p className="section-label py-1.5">{group.group}</p>
                  {group.items.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => { setSelected(item.value); if (item.value !== "custom") setDateOpen(false); runRefresh(); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-100"
                      style={{
                        background: selected === item.value ? "var(--blue-muted)" : "transparent",
                        color: selected === item.value ? "var(--blue)" : "var(--text-2)",
                        borderRadius: "var(--r-md)",
                      }}
                      onMouseEnter={(e) => { if (selected !== item.value) (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; }}
                      onMouseLeave={(e) => { if (selected !== item.value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {selected === "custom" && (
              <div className="border-t p-3 space-y-2.5" style={{ borderColor: "var(--border)" }}>
                <p className="section-label">Período personalizado</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "De",  val: customStart, set: (v: string) => setCustomStart(v) },
                    { label: "Até", val: customEnd,   set: (v: string) => setCustomEnd(v) },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-[11px] font-semibold mb-1 block" style={{ color: "var(--text-4)" }}>{f.label}</label>
                      <input type="date" value={f.val} onChange={(e) => f.set(e.target.value)}
                        className="input text-[12px] py-1.5"
                        style={{ colorScheme: isDark ? "dark" : "light" }} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setDateOpen(false); runRefresh(); }}
                  disabled={!customStart || !customEnd}
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

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Date display */}
        {mounted && (
          <span className="text-[12px] font-medium hidden lg:block mr-2" style={{ color: "var(--text-4)" }}>
            {format(new Date(), "EEE, d MMM yyyy", { locale: ptBR })}
          </span>
        )}

        <button
          onClick={runRefresh}
          disabled={isLoading}
          className="btn-icon hidden sm:flex"
          title="Sincronizar"
        >
          <RefreshCw className={cn("w-[15px] h-[15px]", isLoading && "animate-spin")} strokeWidth={2.5} />
        </button>

        <NotificationBell />

        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="btn-icon"
            title={isDark ? "Modo claro" : "Modo escuro"}
          >
            {isDark
              ? <Sun className="w-[15px] h-[15px]" strokeWidth={2.5} />
              : <Moon className="w-[15px] h-[15px]" strokeWidth={2.5} />}
          </button>
        )}
      </div>
    </header>
  );
}
