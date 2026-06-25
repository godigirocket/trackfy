import { HelpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  tooltip: string;
  delta?: number;
  highlight?: "green" | "red" | "blue" | "yellow";
  loading?: boolean;
}

export function MetricCard({ label, value, tooltip, delta, highlight, loading }: MetricCardProps) {
  const valueStyle: Record<string, string> = {
    green:  "var(--green)",
    red:    "var(--red)",
    blue:   "var(--blue)",
    yellow: "var(--yellow)",
  };

  return (
    <div
      className="card p-5 flex flex-col gap-3 group relative"
      style={{ cursor: "default" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <span className="stat-label">{label}</span>
        <div className="relative">
          <HelpCircle
            className="w-3.5 h-3.5 cursor-help transition-colors"
            style={{ color: "var(--text-4)" }}
            strokeWidth={2}
          />
          {/* Tooltip */}
          <div
            className="absolute right-0 top-5 z-50 w-52 p-3 text-[12px] leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow-xl)",
              color: "var(--text-3)",
            }}
          >
            {tooltip}
          </div>
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <div
          className="h-7 w-24 rounded-lg animate-pulse"
          style={{ background: "var(--bg-muted)" }}
        />
      ) : (
        <p
          className="stat-value"
          style={highlight ? { color: valueStyle[highlight] } : {}}
        >
          {value}
        </p>
      )}

      {/* Delta */}
      {delta !== undefined && !loading && (
        <div className={cn("stat-delta", delta >= 0 ? "up" : "down")}>
          {delta >= 0
            ? <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
            : <TrendingDown className="w-3 h-3" strokeWidth={2.5} />}
          {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
        </div>
      )}
    </div>
  );
}
