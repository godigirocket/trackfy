"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { TokenManager } from "@/components/layout/TokenManager";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Topbar() {
  const { period, setPeriod, userName } = useAppStore();

  const periods = [
    { label: "Hoje", value: "today" },
    { label: "Ontem", value: "yesterday" },
    { label: "7D", value: "last_7d" },
    { label: "30D", value: "last_30d" },
    { label: "Máximo", value: "maximum" },
  ];

  return (
    <header className="h-16 glass border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-6">
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                period === p.value 
                  ? "bg-background text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-[1px] bg-border mx-2" />

        <Button variant="outline" size="sm" className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-border bg-background">
          <RefreshCw className="w-3.5 h-3.5" />
          Sincronizar
        </Button>
        
        <TokenManager />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <ThemeToggle />

        <div className="h-6 w-[1px] bg-border mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 flex items-center gap-3 pl-1 pr-3 rounded-full border border-border hover:bg-muted transition-all text-sm font-medium">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                  {userName?.substring(0, 2).toUpperCase() || "JU"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-[10px] font-black tracking-tight">{userName}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Admin</p>
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-border bg-card" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground uppercase tracking-widest mt-1">
                  juam.premium@trackfy.io
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs font-bold uppercase tracking-widest">Meu Perfil</DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-bold uppercase tracking-widest">Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive font-black text-xs uppercase tracking-widest">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
