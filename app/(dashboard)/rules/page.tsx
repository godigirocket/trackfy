"use client";

import { RuleEditor } from "@/components/rules/RuleEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, AlertCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

export default function RulesPage() {
  const rules = useAppStore((state) => state.automationRules) || [];
  const toggleRule = useAppStore((state) => state.toggleRule);
  const removeRule = useAppStore((state) => state.removeRule);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Regras e Automação ⚡</h1>
          <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
            Automatize sua gestão e evite desperdício de orçamento.
          </p>
        </div>
        <RuleEditor />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={cn(
            "border-border transition-all",
            rule.enabled ? "bg-card hover:bg-muted/30" : "bg-muted/20 opacity-60"
          )}>
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0",
                  rule.enabled ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"
                )}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black tracking-tight uppercase">{rule.name}</h3>
                    {!rule.enabled && <Badge variant="secondary" className="text-[8px] font-bold uppercase tracking-widest">Inativa</Badge>}
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Se <span className="font-bold text-foreground uppercase">{rule.metric} {rule.operator === "gt" ? ">" : "<"} {rule.value}</span>, então <span className="font-bold text-primary uppercase">{rule.action.replace("_", " ")}</span>.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      <AlertCircle className="w-3 h-3" />
                      {rule.target || "Todas as Campanhas Ativas"}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      Última execução: {rule.lastRun || "Nunca executada"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex items-center gap-3 mr-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)} className="h-10 w-10 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <Zap className="w-12 h-12" />
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma regra configurada ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
