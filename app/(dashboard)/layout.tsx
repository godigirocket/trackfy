"use client";
import { useEffect, useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex h-dvh overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <ConquestBar />
        <main
          className="flex-1 overflow-auto p-3 sm:p-4 md:px-7 md:py-6"
          style={{ background: "var(--bg)" }}
        >
          {children}
        </main>
        <TutorialHub />
      </div>
    </div>
  );
}
