"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Zap, Smartphone, Image, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Dashboard",   href: "/dashboard",    icon: LayoutGrid },
  { label: "Intel",       href: "/intelligence", icon: Zap },
  { label: "Meta Ads",    href: "/campaigns",    icon: Smartphone },
  { label: "Criativos",   href: "/campaigns/creatives", icon: Image },
  { label: "Config",      href: "/settings",     icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/campaigns") return pathname === "/campaigns" || pathname === "/campaigns/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 md:hidden z-50 bg-[var(--bg-surface)] border-t border-[var(--border)] px-2">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {ITEMS.map(item => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all duration-200",
                active ? "text-[#6C5CE7]" : "text-[var(--text-muted)]"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "animate-pulse-slow")} />
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
              {active && (
                <div className="absolute bottom-0 w-8 h-1 bg-[#6C5CE7] rounded-t-full shadow-[0_-4px_10px_#6C5CE7]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
