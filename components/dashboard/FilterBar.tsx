"use client";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useFilterStore, PERIOD_OPTIONS } from "@/store/useFilterStore";
import type { PeriodFilter, TrafficSource, Platform } from "@/store/useFilterStore";

function Select<T extends string>({
  label, value, options, onChange, tooltip,
}: {
  label: string; value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  tooltip?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <span className="section-label" style={{ padding: 0 }}>{label}</span>
        {tooltip && <HelpCircle className="w-3 h-3" style={{ color: "var(--text-4)" }} strokeWidth={2} />}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="select min-w-[130px]"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          style={{ color: "var(--text-4)" }}
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
}

export function FilterBar() {
  const {
    period, adAccount, trafficSource, platform, product,
    setPeriod, setAdAccount, setTrafficSource, setPlatform, setProduct,
  } = useFilterStore();

  return (
    <div className="flex items-end gap-3 flex-wrap">
      <Select<PeriodFilter>
        label="Período"
        value={period}
        onChange={setPeriod}
        tooltip="Período para cálculo das métricas"
        options={PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      />
      <Select label="Conta de Anúncio" value={adAccount} onChange={setAdAccount}
        options={[{ value: "qualquer", label: "Qualquer" }, { value: "conta1", label: "Conta Principal" }, { value: "conta2", label: "Conta Secundária" }]} />
      <Select<TrafficSource> label="Fonte de Tráfego" value={trafficSource} onChange={setTrafficSource}
        options={[{ value: "todos", label: "Qualquer" }, { value: "meta", label: "Meta Ads" }, { value: "google", label: "Google Ads" }, { value: "tiktok", label: "TikTok Ads" }, { value: "organico", label: "Orgânico" }]} />
      <Select<Platform> label="Plataforma" value={platform} onChange={setPlatform}
        options={[{ value: "todas", label: "Qualquer" }, { value: "desktop", label: "Desktop" }, { value: "mobile", label: "Mobile" }, { value: "tablet", label: "Tablet" }]} />
      <Select label="Produto" value={product} onChange={setProduct}
        options={[{ value: "qualquer", label: "Qualquer" }, { value: "prod1", label: "Produto 1" }, { value: "prod2", label: "Produto 2" }]} />
    </div>
  );
}
