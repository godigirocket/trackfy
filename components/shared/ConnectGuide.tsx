"use client";
import { ExternalLink, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Step { title: string; description: string; link?: { label: string; url: string }; }
interface ConnectGuideProps { platform: string; icon: React.ReactNode; color: string; steps: Step[]; settingsHref?: string; }

export function ConnectGuide({ platform, icon, color, steps, settingsHref = "/dashboard/settings" }: ConnectGuideProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>{platform} não conectado</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>Siga o passo a passo para integrar sua conta</p>
        </div>
        <a href={settingsHref} className="btn-primary px-4 py-2 shrink-0">Conectar agora</a>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 text-[13px] font-medium transition-colors duration-100"
        style={{ color: "var(--text-3)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span>Ver passo a passo ({steps.length} etapas)</span>
        {expanded ? <ChevronUp className="w-4 h-4" strokeWidth={2.5} /> : <ChevronDown className="w-4 h-4" strokeWidth={2.5} />}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold border-2"
                  style={{ background: "var(--blue-light)", borderColor: "rgba(59,130,246,0.3)", color: "var(--blue)" }}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 my-1" style={{ background: "var(--border)" }} />}
              </div>
              <div className="pb-5 min-w-0 flex-1">
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{step.title}</p>
                <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>{step.description}</p>
                {step.link && (
                  <a href={step.link.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold transition-colors"
                    style={{ color: "var(--blue)" }}>
                    {step.link.label} <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
                  </a>
                )}
              </div>
            </div>
          ))}
          <div
            className="flex items-center gap-3 p-4 rounded-xl border mt-1"
            style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
          >
            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--green)" }} strokeWidth={2.5} />
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>Pronto para conectar?</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>Cole suas credenciais nas Configurações</p>
            </div>
            <a href={settingsHref} className="btn-primary px-3 py-1.5 text-[12px]">Configurações</a>
          </div>
        </div>
      )}
    </div>
  );
}
