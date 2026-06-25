"use client";
import { useState } from "react";
import { Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { LEVELS } from "@/lib/constants";
import { fmtCurrency, fmtCompact, cn } from "@/lib/utils";
import { safeArray } from "@/lib/safeArray";

export function ConquestBar() {
  const { campaigns }   = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const list            = safeArray(campaigns);

  const totalSpend       = list.reduce((s, c) => s + c.spend, 0);
  const totalConversions = list.reduce((s, c) => s + c.conversions, 0);
  const estimatedRevenue = totalSpend * 2.8;
  const roi              = totalSpend > 0 ? ((estimatedRevenue - totalSpend) / totalSpend) * 100 : 0;

  const level     = LEVELS.find((l) => totalSpend >= l.min && totalSpend < l.max) ?? LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const progress  = nextLevel ? ((totalSpend - level.min) / (nextLevel.min - level.min)) * 100 : 100;

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Collapsed — very subtle single line */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-1.5 transition-colors duration-100 group"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Level badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Trophy className="w-3 h-3" style={{ color: "var(--yellow)", opacity: 0.6 }} strokeWidth={2} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-4)", textTransform: "uppercase" }}>
            {level.name}
          </span>
          <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, progress)}%`, background: "var(--blue)", opacity: 0.5 }} />
          </div>
        </div>

        <div className="w-px h-3 shrink-0" style={{ background: "var(--border)" }} />

        {/* Stats — compact */}
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          {[
            { label: "Investido",       value: fmtCurrency(totalSpend) },
            { label: "Faturado (est.)", value: fmtCurrency(estimatedRevenue) },
            { label: "Conversões",      value: fmtCompact(totalConversions) },
            { label: "ROI",             value: `${roi.toFixed(1)}%`, up: roi >= 0 },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1 shrink-0">
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "up" in s ? (s.up ? "var(--green)" : "var(--red)") : "var(--text-3)", opacity: 0.75 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <ChevronDown
          className={cn("w-3 h-3 shrink-0 transition-transform duration-200", expanded && "rotate-180")}
          style={{ color: "var(--text-4)" }}
          strokeWidth={2.5}
        />
      </button>

      {/* Expanded levels */}
      {expanded && (
        <div className="px-5 py-3 border-t" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {LEVELS.map((l, i) => {
              const isCurrent = l.name === level.name;
              const isPast    = i < LEVELS.indexOf(level);
              const isNext    = i === LEVELS.indexOf(level) + 1;
              return (
                <div key={l.name} className="flex items-center gap-1 shrink-0">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: isCurrent ? "var(--blue-muted)" : "transparent",
                      border: `1px solid ${isCurrent ? "rgba(37,99,235,0.25)" : "var(--border)"}`,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: isCurrent ? "var(--blue)" : isPast ? "var(--green)" : "var(--border-2)" }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? "var(--blue)" : isPast ? "var(--text-3)" : "var(--text-4)" }}>
                      {l.name}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-4)" }}>
                      {l.max === Infinity ? `R$ ${(l.min / 1000).toFixed(0)}k+` : `até R$ ${(l.max / 1000).toFixed(0)}k`}
                    </span>
                  </div>
                  {i < LEVELS.length - 1 && (
                    <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "var(--border-2)" }} strokeWidth={2} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
