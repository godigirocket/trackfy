"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Link2, Layout, Image, DollarSign, ChevronDown } from "lucide-react";
import { useState } from "react";

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
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold gradient-text">TRACKIFY</h1>
        <p className="text-xs text-muted-foreground">ENTERPRISE TRACKING</p>
      </div>
      <nav className="flex-1 px-4 space-y-6">
        {navItems.map((section) => (
          <div key={section.category}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section.category}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <div key={item.name}>
                  {item.subitems ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname.startsWith(item.subitems[0].href) || openMenus[item.name]
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openMenus[item.name] ? "rotate-180" : ""}`} />
                      </button>
                      {openMenus[item.name] && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subitems.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`block px-3 py-1.5 rounded-lg text-sm ${
                                pathname === sub.href
                                  ? "bg-primary/20 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                              }`}
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        pathname === item.href
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-white/5"
                      }`}
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
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">PREMIUM PLAN</div>
      </div>
    </aside>
  );
}
