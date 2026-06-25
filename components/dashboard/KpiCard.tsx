import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  loading?: boolean;
}

export function KpiCard({ label, value, delta, icon: Icon, loading }: KpiCardProps) {
  const positive = delta !== undefined && delta >= 0;

  return (
    <div className="bg-white dark:bg-[#13161f] border border-slate-200 dark:border-[#1e2130] rounded-xl p-5 hover:border-blue-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8892a4]">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-28 rounded-lg animate-pulse bg-slate-100 dark:bg-[#1e2130]" />
          ) : (
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 ml-3">
          <Icon className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
        </div>
      </div>

      {delta !== undefined && !loading && (
        <div className={cn("flex items-center gap-1.5 mt-3 text-xs font-bold", positive ? "text-green-500" : "text-red-500")}>
          {positive
            ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            : <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />}
          {positive ? "+" : ""}{delta.toFixed(1)}% vs período anterior
        </div>
      )}
    </div>
  );
}
