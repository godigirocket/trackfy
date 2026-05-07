"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Link2, Layout, DollarSign, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    category: "CORE",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        name: "Rastreamento",
        icon: Link2,
        subitems: [
          { name: "Integrações", href: "/integrations" },
          { name: "UTMs", href: "/utms" },
        ],
      },
    ],
  },
  {
    category: "ADS MANAGER",
    items: [
      {
        name: "Meta Ads",
        icon: Layout,
        subitems: [
          { name: "Campanhas", href: "/dashboard" },
          { name: "Criativos", href: "/creatives" },
        ],
      },
    ],
  },
  {
    category: "FINANCEIRO",
    items: [{ name: "Geral", href: "/finance", icon: DollarSign }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Rastreamento": true,
    "Meta Ads": true
  });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0 overflow-hidden">
      <div className="p-6">
        <h1 className="text-xl font-bold gradient-text tracking-tighter">TRACKFY</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">ENTERPRISE TRACKING</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        {navItems.map((section) => (
          <div key={section.category}>
            <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-4 px-3">
              {section.category}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <div key={item.name}>
                  {item.subitems ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-widest group",
                          pathname.startsWith(item.subitems[0].href) || openMenus[item.name]
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            openMenus[item.name] ? "rotate-180" : ""
                          )}
                        />
                      </button>
                      {openMenus[item.name] && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-white/5 pl-2">
                          {item.subitems.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={cn(
                                "block px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                                pathname === sub.href
                                  ? "text-primary"
                                  : "text-muted-foreground/40 hover:text-white"
                              )}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-widest",
                        pathname === item.href
                          ? "bg-primary/10 text-primary shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]"
                          : "text-muted-foreground/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-6 border-t border-border">
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           PREMIUM PLAN
        </div>
      </div>
    </aside>
  );
}
