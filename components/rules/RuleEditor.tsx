"use client";

import { useState, ChangeEvent } from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Zap, AlertTriangle } from "lucide-react";
import { useAppStore, AutomationRule } from "@/store/useAppStore";
import { toast } from "sonner";

export function RuleEditor() {
  const [open, setOpen] = useState(false);
  const addRule = useAppStore(state => state.addRule);

  const [name, setName] = useState("");
  const [metric, setMetric] = useState("cpl");
  const [operator, setOperator] = useState<"gt" | "lt">("gt");
  const [value, setValue] = useState("");
  const [action, setAction] = useState<"pause" | "notify" | "budget_down">("pause");

  const handleSave = () => {
    if (!name.trim() || !value) {
      toast.error("Preencha todos os campos da regra!");
      return;
    }

    const newRule: AutomationRule = {
      id: Math.random().toString(36).substring(7),
      name,
      metric,
      operator,
      value: parseFloat(value),
      action,
      enabled: true,
      target: "Todas as Campanhas Ativas",
      lastRun: "Nunca executada"
    };

    addRule(newRule);
    toast.success("Regra de automação salva com sucesso!");
    setOpen(false);
    
    // reset
    setName("");
    setValue("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-12 gap-2 text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground rounded-2xl px-6 shadow-lg shadow-primary/20 flex items-center transition-all hover:bg-primary/90">
        <Plus className="w-4 h-4" /> Nova Regra de Automação
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Configurar Automação
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Defina gatilhos automáticos para economizar orçamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Regra</Label>
            <Input 
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Ex: Pausar CPL Alto" 
              className="h-12 bg-muted/30 border-border font-bold" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Se a métrica...</Label>
              <Select value={metric} onValueChange={(val) => val && setMetric(val)}>
                <SelectTrigger className="h-12 bg-muted/30 border-border font-bold">
                  <SelectValue placeholder="Métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpl">CPL</SelectItem>
                  <SelectItem value="roas">ROAS</SelectItem>
                  <SelectItem value="ctr">CTR</SelectItem>
                  <SelectItem value="frequency">Frequência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">For...</Label>
              <div className="flex gap-2">
                <Select value={operator} onValueChange={(val) => val && setOperator(val as "gt"|"lt")}>
                  <SelectTrigger className="h-12 w-20 bg-muted/30 border-border font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">{">"}</SelectItem>
                    <SelectItem value="lt">{"<"}</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  type="number" 
                  value={value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                  placeholder="0.00" 
                  className="h-12 bg-muted/30 border-border font-bold" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Então a ação será...</Label>
            <Select value={action} onValueChange={(val) => val && setAction(val as any)}>
              <SelectTrigger className="h-12 bg-muted/30 border-border font-bold">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pause">Pausar Campanha</SelectItem>
                <SelectItem value="notify">Enviar Notificação</SelectItem>
                <SelectItem value="budget_down">Reduzir Orçamento (20%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              As regras rodam localmente pelo painel ou sincronizadas via cron. Ações de pausa são irreversíveis via IA.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="h-12 flex-1 text-[12px] font-black uppercase tracking-widest rounded-2xl">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="h-12 flex-1 bg-primary text-primary-foreground text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
            Salvar Regra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
