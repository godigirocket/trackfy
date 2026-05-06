"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { InvestmentBar } from "./InvestmentBar";
import { CampaignDrawer } from "@/components/campaigns/CampaignDrawer";

// Pages that use the full app shell (sidebar + topbar)
const APP_ROUTES = [
  "/dashboard", "/intelligence", "/campaigns", "/utms",
  "/integrations", "/orders", "/financial", "/reports",
  "/config", "/settings", "/crm", "/simulator", "/tracking", "/learn"
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp = APP_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"));

  if (!isApp) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <Topbar />
      <InvestmentBar />
      <CampaignDrawer />
      
      <main className="md:pl-[240px] pt-[96px] relative z-10 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 pb-32">
          {children}
        </div>
      </main>
    </div>
  );
}
