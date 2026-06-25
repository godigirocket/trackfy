"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen, CheckCircle, ChevronDown, ExternalLink, HelpCircle, X } from "lucide-react";
import { DEFAULT_TUTORIAL, PAGE_TUTORIALS } from "@/lib/tutorials";

function normalizePath(pathname: string) {
  if (pathname === "/dashboard") return pathname;
  return pathname.replace(/\/$/, "");
}

export function TutorialHub() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const guide = useMemo(() => {
    const path = normalizePath(pathname || "/dashboard");
    return PAGE_TUTORIALS[path] || DEFAULT_TUTORIAL;
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold shadow-lg transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--blue)", color: "white" }}
        aria-label="Abrir tutorial da página"
      >
        <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
        Tutorial
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/20 p-4 sm:p-6">
          <div className="w-full max-w-[430px] max-h-[calc(100vh-48px)] overflow-hidden rounded-xl border shadow-2xl" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-start gap-3 border-b p-4" style={{ borderColor: "var(--border)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--blue-muted)" }}>
                <BookOpen className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>{guide.title}</p>
                <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: "var(--text-3)" }}>{guide.description}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="btn-icon w-8 h-8 shrink-0" aria-label="Fechar tutorial">
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100vh - 180px)" }}>
              <div className="space-y-3">
                {guide.steps.map((step, index) => (
                  <div key={`${step.title}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ background: "var(--blue-light)", color: "var(--blue)" }}>
                        {index + 1}
                      </div>
                      {index < guide.steps.length - 1 && <div className="w-px flex-1 my-1" style={{ background: "var(--border)" }} />}
                    </div>
                    <div className="pb-2">
                      <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{step.title}</p>
                      <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: "var(--text-3)" }}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {guide.tips && guide.tips.length > 0 && (
                <details className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
                  <summary className="flex cursor-pointer items-center justify-between gap-2 text-[13px] font-bold" style={{ color: "var(--text-2)" }}>
                    Dicas rápidas
                    <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                  </summary>
                  <div className="mt-3 space-y-2">
                    {guide.tips.map((tip) => (
                      <div key={tip} className="flex gap-2 text-[12px] leading-relaxed" style={{ color: "var(--text-3)" }}>
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "var(--green)" }} strokeWidth={2.5} />
                        {tip}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {guide.action && (
                <Link href={guide.action.href} onClick={() => setOpen(false)} className="btn-primary w-full justify-center py-2.5">
                  {guide.action.label}
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
