"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Globe, Search, Zap, Coins, DollarSign, ChevronDown, ChevronRight, Bell, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Meta Ads",
    icon: Globe,
    subMenu: [
      { name: "Campanhas", href: "/meta-ads/campaigns" },
      { name: "Conjuntos", href: "/meta-ads/adsets" },
      { name: "Anúncios", href: "/meta-ads/ads" },
      { name: "Criativos", href: "/meta-ads/creatives" },
    ],
  },
  {
    name: "Google Ads",
    icon: Search,
    subMenu: [
      { name: "Campanhas", href: "/google-ads/campaigns" },
    ],
  },
  {
    name: "Inteligência",
    href: "/intelligence",
    icon: Zap,
  },
  {
    name: "UTMs",
    href: "/utms",
    icon: Coins,
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    subMenu: [
      { name: "Geral", href: "/finance" },
      { name: "Pedidos", href: "/finance/orders" },
      { name: "Relatórios", href: "/finance/reports" },
    ],
  },
  {
    name: "Regras",
    href: "/rules",
    icon: Zap,
  },
  {
    name: "Notificações",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    "Meta Ads": pathname.includes("/meta-ads"),
    "Financeiro": pathname.includes("/finance"),
  });

  const toggleSubMenu = (name: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-[240px] glass border-r border-border flex flex-col h-full overflow-y-auto relative z-30">
      <div className="p-6 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0064E0] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-foreground">Trackfy</span>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-11">Enterprise Tracking</p>
      </div>

      <nav className="flex-1 px-4 space-y-8 mt-4">
        {/* Core Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Core</p>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
              pathname === "/" ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Rastreamento Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Rastreamento</p>
          <Link
            href="/integrations"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
              pathname === "/integrations" ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Globe className="w-4 h-4" />
            <span>Integrações</span>
          </Link>
          <Link
            href="/utms"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
              pathname === "/utms" ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Coins className="w-4 h-4" />
            <span>UTMs</span>
          </Link>
        </div>

        {/* Ads Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Ads Manager</p>
          <button
            onClick={() => toggleSubMenu("Meta Ads")}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all",
              pathname.includes("/meta-ads") ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4" />
              <span>Meta Ads</span>
            </div>
            {openSubMenus["Meta Ads"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openSubMenus["Meta Ads"] && (
            <div className="ml-9 space-y-1 mt-1 border-l border-border pl-3">
              {[
                { name: "Campanhas", href: "/meta-ads/campaigns" },
                { name: "Criativos", href: "/meta-ads/creatives" }
              ].map(sub => (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className={cn(
                    "block py-1.5 text-xs font-bold transition-colors",
                    pathname === sub.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Financeiro Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Financeiro</p>
          <Link
            href="/finance"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
              pathname.includes("/finance") ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <DollarSign className="w-4 h-4" />
            <span>Geral</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-border/50">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarFallback className="bg-primary text-white text-xs font-black">JU</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-black text-foreground">juam</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
