"use client";

import { useAppStore } from "@/store/useAppStore";
import { runRefresh } from "@/hooks/useMetaData";
import { RefreshCw } from "lucide-react";

const periods = [
  { label: "HOJE", value: "today" },
  { label: "ONTEM", value: "yesterday" },
  { label: "7D", value: "last_7d" },
  { label: "30D", value: "last_30d" },
  { label: "MÁXIMO", value: "maximum" },
];

export function Topbar() {
  const { period, setPeriod, isLoading } = useAppStore();

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/80 backdrop-blur-sm">
      <div className="flex gap-1 bg-white/5 rounded-full p-1">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value as any)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              period === p.value
                ? "bg-primary text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => runRefresh()}
        className="p-2 rounded-full hover:bg-white/10 transition"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      </button>
    </header>
  );
}
