"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText,
  Tag, Zap, Percent, Receipt, BarChart2, Settings, User,
  LogOut, Bell, Image, ChevronRight, Crown, Wrench, PanelLeftClose, PanelLeftOpen, Target, Lightbulb, Radar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/components/shared/BrandIcon";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { clearLocalSession, getLocalUser, PLAN_LABELS } from "@/lib/localAuth";
import { useEffect, useState } from "react";

const nav = [
  {
    group: "Principal",
    items: [
      { href: "/dashboard",        label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/operacao", label: "Operação", icon: Target },
      { href: "/dashboard/intelligence", label: "Inteligência", icon: Lightbulb },
      { href: "/dashboard/market", label: "Mercado/Spy", icon: Radar },
      { href: "/dashboard/resumo", label: "Resumo",    icon: FileText },
      { href: "/dashboard/tools",  label: "Ferramentas", icon: Wrench },
    ],
  },
  {
    group: "Meta Ads",
    items: [
      { href: "/dashboard/campaigns", label: "Campanhas", brand: "meta", dot: true },
      { href: "/dashboard/creatives", label: "Criativos",  icon: Image },
    ],
  },
  {
    group: "Outras Fontes",
    items: [
      { href: "/dashboard/google", label: "Google Ads", brand: "google" },
      { href: "/dashboard/tiktok", label: "TikTok Ads", brand: "tiktok" },
    ],
  },
  {
    group: "Ferramentas",
    items: [
      { href: "/dashboard/utms",       label: "UTMs",       icon: Tag },
      { href: "/dashboard/rules",      label: "Regras",     icon: Zap },
      { href: "/dashboard/taxas",      label: "Taxas",      icon: Percent },
      { href: "/dashboard/finance",    label: "Despesas",   icon: Receipt },
      { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart2 },
    ],
  },
  {
    group: "Conta",
    items: [
      { href: "/dashboard/profile",       label: "Perfil",        icon: User },
      { href: "/dashboard/settings",      label: "Configurações", icon: Settings },
      { href: "/dashboard/notifications", label: "Notificações",  icon: Bell },
      { href: "/admin",                   label: "Admin",         icon: Crown },
    ],
  },
];

export function Sidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { token, accountId } = useAppStore();
  const [localUser, setLocalUser] = useState<ReturnType<typeof getLocalUser>>(null);
  const [collapsed, setCollapsed] = useState(false);
  const isConnected = !!(token && accountId);

  useEffect(() => {
    setLocalUser(getLocalUser());
  }, []);

  const handleSignOut = async () => {
    clearLocalSession();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className="shrink-0 flex flex-col h-screen transition-all duration-200"
      style={{ width: collapsed ? 68 : 216, background: "var(--bg-subtle)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div className="h-[56px] flex items-center justify-between px-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-150 group-hover:scale-105"
            style={{ background: "var(--blue)", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
          >
            {/* Inline SVG logo */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 11L5.5 7L8.5 9.5L11.5 5L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="7" r="1.2" fill="white"/>
            </svg>
          </div>
          {!collapsed && <span className="font-bold text-[15px] tracking-tight" style={{ color: "var(--text-1)" }}>Trackfy</span>}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="btn-icon w-8 h-8"
          title={collapsed ? "Abrir menu" : "Fechar menu"}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" strokeWidth={2.5} /> : <PanelLeftClose className="w-4 h-4" strokeWidth={2.5} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {nav.map((section) => (
          <div key={section.group}>
            {!collapsed && (
              <p className="px-2.5 mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-4)" }}>
                {section.group}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-100"
                    style={{
                      background: active ? "var(--blue-muted)" : "transparent",
                      color: active ? "var(--blue)" : "var(--text-3)",
                      fontWeight: active ? 600 : 500,
                      fontSize: 13,
                    }}
                    onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; } }}
                    onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; } }}
                  >
                    {"brand" in item && item.brand ? (
                      <BrandIcon brand={item.brand as "meta" | "google" | "tiktok" | "gemini"} className="w-[16px] h-[16px] shrink-0" />
                    ) : (
                      (() => {
                        const Icon = (item as { icon: any }).icon;
                        return <Icon
                        className="w-[15px] h-[15px] shrink-0"
                        strokeWidth={active ? 2.5 : 2}
                        style={{ color: active ? "var(--blue)" : "var(--text-4)" }}
                        />;
                      })()
                    )}
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {"dot" in item && item.dot && !collapsed && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isConnected ? "var(--green)" : "var(--border-2)" }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-2.5" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg transition-all duration-100 mb-0.5"
          title={collapsed ? "Sair" : undefined}
          style={{ color: "var(--text-4)", fontSize: 13, fontWeight: 500 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-4)"; }}
        >
          <LogOut className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
          {!collapsed && "Sair"}
        </button>

        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-100"
          title={collapsed ? "Perfil" : undefined}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
          >
            U
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }} className="truncate">{localUser?.name ?? "Usuário"}</p>
                <p style={{ fontSize: 11, color: "var(--text-4)" }} className="truncate">
                  Plano {PLAN_LABELS[localUser?.plan ?? "pro"]}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-4)" }} strokeWidth={2} />
            </>
          )}
        </Link>
      </div>
    </aside>
  );
}
