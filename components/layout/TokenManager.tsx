"use client";

import type { ChangeEvent } from "react";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KeyRound, LogOut, CheckCircle2 } from "lucide-react";

export function TokenManager() {
  const {
    metaToken, accountId,
    setMetaToken, setAccountId,
    setDataA, setMetaAdsData,
    setHourlyDataA, setAgeBreakdownA,
    setGenderBreakdownA, setRegionBreakdownA,
  } = useAppStore();

  const [open, setOpen] = useState(false);
  const [tempToken, setTempToken] = useState(metaToken || "");
  const [tempAccount, setTempAccount] = useState(accountId || "");

  const handleSave = () => {
    setMetaToken(tempToken);
    setAccountId(tempAccount);
    setOpen(false);
  };

  const handleDisconnect = () => {
    setMetaToken(null);
    setAccountId(null);
    setTempToken("");
    setTempAccount("");
    setDataA([]);
    setMetaAdsData([]);
    setHourlyDataA([]);
    setAgeBreakdownA([]);
    setGenderBreakdownA([]);
    setRegionBreakdownA([]);
    setOpen(false);
  };

  const isConnected = !!(metaToken && accountId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-border bg-background">
            <KeyRound className="w-3.5 h-3.5" />
            {isConnected ? "Tokens Ativos" : "Configurar Tokens"}
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">Gerenciar Tokens</DialogTitle>
          <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Insira suas credenciais do Meta Ads para sincronizar os dados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="accountId" className="text-[10px] font-black uppercase tracking-widest">ID da Conta (Ex: act_12345)</Label>
            <Input
              id="accountId"
              value={tempAccount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTempAccount(e.target.value)}
              className="bg-muted/50 border-border"
              placeholder="act_123456789"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="token" className="text-[10px] font-black uppercase tracking-widest">Token de Acesso (User Token)</Label>
            <Input
              id="token"
              type="password"
              value={tempToken}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTempToken(e.target.value)}
              className="bg-muted/50 border-border"
              placeholder="EAA..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          {isConnected ? (
            <Button variant="destructive" onClick={handleDisconnect} className="gap-2 text-[10px] font-black uppercase tracking-widest">
              <LogOut className="w-4 h-4" />
              Desconectar
            </Button>
          ) : <div />}

          <Button
            onClick={handleSave}
            disabled={!tempToken || !tempAccount}
            className="gap-2 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CheckCircle2 className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
