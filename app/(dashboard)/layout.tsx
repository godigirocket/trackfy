"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ConquestBar } from "@/components/layout/ConquestBar";
import { TutorialHub } from "@/components/shared/TutorialHub";
import { useAppStore } from "@/store/useAppStore";
import { safeGetSession } from "@/lib/supabase";
import { hasLocalSession } from "@/lib/localAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const _hydrate = useAppStore((s) => s._hydrate);

  useEffect(() => {
    _hydrate();
    let cancelled = false;
    safeGetSession().then((data) => {
      if (cancelled) return;
      if (hasLocalSession()) return;
      if (!data.session) router.push("/login");
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <ConquestBar />
        <main
          className="flex-1 overflow-auto"
          style={{ background: "var(--bg)", padding: "24px 28px" }}
        >
          {children}
        </main>
        <TutorialHub />
      </div>
    </div>
  );
}
