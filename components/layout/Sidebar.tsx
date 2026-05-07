"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Settings, 
  Link2, 
  Target, 
  Search, 
  Wallet,
  Zap,
  BarChart2,
  FileText,
  Bell,
  User,
  ShieldCheck,
  TrendingUp,
  Percent,
  Download,
  Layout
} from "lucide-react";

const menuItems = [
  { label: "Resumo", icon: LayoutDashboard, href: "/" },
  { label: "Meta", icon: Layout, href: "/meta-ads/campaigns" },
  { label: "Google", icon: Search, href: "/google-ads" },
  { label: "Kwai", icon: TrendingUp, href: "/kwai" },
  { label: "TikTok", icon: TrendingUp, href: "/tiktok" },
  { label: "UTMs", icon: Target, href: "/utms" },
  { label: "Integrações", icon: Link2, href: "/integrations" },
  { label: "Regras", icon: Zap, href: "/rules" },
  { label: "Taxas", icon: Percent, href: "/taxes" },
  { label: "Despesas", icon: Wallet, href: "/expenses" },
  { label: "Relatórios", icon: FileText, href: "/reports" },
  { label: "Notificações", icon: Bell, href: "/notifications" },
  { label: "Assinatura", icon: ShieldCheck, href: "/subscription" },
  { label: "Minha conta", icon: User, href: "/account" },
  { label: "Avançado", icon: Settings, href: "/advanced" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#1e2330] w-56 overflow-y-auto">
      {/* Logo Area */}
      <div className="flex items-center gap-2 px-6 py-8">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Zap className="text-white fill-white" size={16} />
        </div>
        <span className="font-black text-xl tracking-tighter text-white italic">utmify</span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={16} className={cn(
                isActive ? "text-white" : "text-gray-500 group-hover:text-white"
              )} />
              <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
              {item.label === "Novidades" && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">10</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer App Download */}
      <div className="p-4 mt-auto">
        <Link 
          href="/app" 
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Download size={16} />
          <span className="text-[13px] font-bold">Aplicativo</span>
        </Link>
      </div>
    </div>
  );
}
