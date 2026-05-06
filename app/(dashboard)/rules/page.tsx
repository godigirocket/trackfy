"use client";

import { useState } from "react";
import { RuleEditor } from "@/components/rules/RuleEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Trash2, Cpu, Zap, Activity } from "lucide-react";

export default function RulesPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Growth Rules ⚡</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Automação baseada em ROI, CPL e frequência.
          </p>
        </div>
        <Button onClick={() => setIsEditorOpen(true)} className="bg-primary text-primary-foreground font-black uppercase tracking-widest gap-2">
          <Plus size={18} />
          Criar Nova Regra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="obsidian-card border-primary/20">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Regras Ativas</p>
              <h3 className="text-2xl font-black">12</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="obsidian-card border-border">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              <Cpu size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execuções (Hoje)</p>
              <h3 className="text-2xl font-black">1.458</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="obsidian-card border-green-500/20">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Economia Estimada</p>
              <h3 className="text-2xl font-black text-green-500">R$ 4.250</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {[
          { name: "Pausar ROI Negativo", trigger: "ROI < 1.0", action: "Pausar Campanha", status: "Active", frequency: "A cada 15min" },
          { name: "Escalar Top Performers", trigger: "CPL < R$ 10,00", action: "Aumentar Orçamento 20%", status: "Active", frequency: "Diário" },
          { name: "Aviso de Fadiga de Criativo", trigger: "CTR < 0.8%", action: "Enviar Notificação", status: "Paused", frequency: "A cada 1h" }
        ].map((rule) => (
          <Card key={rule.name} className="obsidian-card group hover:border-primary/30 transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-3 h-3 rounded-full ${rule.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                <div>
                  <h4 className="font-black uppercase tracking-tight text-lg">{rule.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gatilho: <span className="text-primary">{rule.trigger}</span></span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Frequência: {rule.frequency}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="font-black uppercase text-[10px] tracking-widest gap-2">
                  {rule.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                  {rule.status === 'Active' ? 'Pausar' : 'Ativar'}
                </Button>
                <Button variant="outline" size="sm" className="font-black uppercase text-[10px] tracking-widest gap-2 text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                  Deletar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RuleEditor isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
    </div>
  );
}
