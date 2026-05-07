"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ConquestBar } from "@/components/layout/ConquestBar";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="flex h-screen bg-[#0F0F1A] items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0F0F1A] overflow-hidden text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          <ConquestBar />
          <main className="px-8 mt-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
