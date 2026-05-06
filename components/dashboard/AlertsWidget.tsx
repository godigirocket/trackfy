"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowUpRight, Clock, Zap } from "lucide-react";
import Link from "next/link";

const ALERTS = [
  {
    id: 1,
    title: "CPL Crítico Detectado",
    desc: "A campanha 'Black Friday VIPS' ultrapassou o limite de R$ 85,00/lead.",
    time: "há 12 min",
    type: "danger"
  },
  {
    id: 2,
    title: "Sessão Meta Ads expirando",
    desc: "Seu token do Facebook Ads expira em 48h. Reconecte para evitar falhas.",
    time: "há 2h",
    type: "warning"
  },
  {
    id: 3,
    title: "Regra Acionada: Pausa Automática",
    desc: "O conjunto 'Lookalike 1%' foi pausado por frequência alta (> 3.5).",
    time: "há 5h",
    type: "info"
  }
];

export function AlertsWidget() {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Alertas Inteligentes
        </CardTitle>
        <Link href="/notifications" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
          Ver todos <ArrowUpRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {ALERTS.map((alert) => (
          <div key={alert.id} className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
            <div className="mt-0.5">
              <AlertCircle className={`w-4 h-4 ${
                alert.type === 'danger' ? 'text-rose-500' : 
                alert.type === 'warning' ? 'text-amber-500' : 'text-primary'
              }`} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-black tracking-tight">{alert.title}</h4>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                  <Clock className="w-2.5 h-2.5" />
                  {alert.time}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                {alert.desc}
              </p>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
            <Zap className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Otimização Sugerida</p>
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed mt-0.5">
                Reduza o orçamento do Conjunto 'Retargeting 7D' em 20% para melhorar o ROAS.
              </p>
            </div>
            <button className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-all">
              Aplicar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
