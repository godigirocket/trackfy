"use client";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";

const NOTIFICATIONS = [
  { id: 1, title: "Token Expirando", msg: "Reconecte sua conta Meta Ads em 24h.", icon: AlertCircle, color: "text-amber-500", time: "1h" },
  { id: 2, title: "Regra Executada", msg: "Campanha 'Escala' foi pausada.", icon: Zap, color: "text-primary", time: "3h" },
];

export function NotificationBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 border-border bg-card p-2" align="end">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground p-3">
          Notificações Recentes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {NOTIFICATIONS.map(n => (
            <DropdownMenuItem key={n.id} className="p-3 focus:bg-muted/50 rounded-xl cursor-pointer">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <n.icon className={cn("w-4 h-4", n.color)} />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black tracking-tight">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">{n.msg}</p>
                  <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground/60 uppercase">
                    <Clock className="w-2.5 h-2.5" />
                    há {n.time}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0">
          <Link href="/notifications" className="w-full text-center py-2.5 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
            Ver todas as notificações
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
