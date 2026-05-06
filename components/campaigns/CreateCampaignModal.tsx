"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { createCampaign } from "@/services/metaApi";
import { X, Target, DollarSign, Zap, Loader2, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runRefresh, clearFetchCache } from "@/hooks/useMetaData";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OBJECTIVES = [
  { id: "OUTCOME_SALES", label: "Vendas", icon: <DollarSign className="w-5 h-5 text-emerald-400" />, desc: "Encontre pessoas propensas a comprar seu produto." },
  { id: "OUTCOME_LEADS", label: "Leads", icon: <Users className="w-5 h-5 text-blue-400" />, desc: "Gere cadastros para o seu negócio." },
  { id: "OUTCOME_ENGAGEMENT", label: "Engajamento", icon: <Zap className="w-5 h-5 text-yellow-400" />, desc: "Obtenha mais mensagens, visualizações ou curtidas." },
  { id: "OUTCOME_TRAFFIC", label: "Tráfego", icon: <Target className="w-5 h-5 text-indigo-400" />, desc: "Envie pessoas para um site ou app." },
];

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const { metaToken, accountId } = useAppStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("OUTCOME_SALES");
  const [budget, setBudget] = useState("50.00");

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return toast("Dê um nome para a campanha", "error");
    
    setLoading(true);
    try {
      if (!accountId || !metaToken) {
        toast("Erro: Conta de anúncios ou Token não configurados.", "error");
        return;
      }

      const budgetInCents = Math.round(parseFloat(budget.replace(",", ".")) * 100);
      const res = await createCampaign(accountId, metaToken, {
        name,
        objective: objective as any,
        status: "PAUSED",
        daily_budget: budgetInCents,
        special_ad_categories: [],
      });

      if (res && res.id) {
        toast("Campanha criada com sucesso! 🎉", "success");
        clearFetchCache();
        runRefresh();
        onClose();
      } else {
        throw new Error(res?.error || "Erro desconhecido na Meta");
      }
    } catch (e: any) {
      toast(e.message || "Erro ao criar campanha", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-[var(--surface)] border border-[var(--border-2)] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text)] tracking-tight">Criar Nova Campanha</h2>
              <p className="text-[12px] font-medium text-[var(--text-3)] uppercase tracking-widest mt-0.5">Meta Ads Manager</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text)] transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Nome */}
          <div className="space-y-3">
            <label className="text-[12px] font-bold text-[var(--text-2)] uppercase tracking-wider ml-1">Nome da Campanha</label>
            <Input 
              value={name} 
              onChange={(e: any) => setName(e.target.value)}
              placeholder="Ex: [VENDAS] - Produto X - 2024"
              className="h-14 bg-[var(--surface-2)] border-[var(--border-2)] text-[15px] font-bold rounded-2xl focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Objetivo */}
          <div className="space-y-3">
            <label className="text-[12px] font-bold text-[var(--text-2)] uppercase tracking-wider ml-1">Objetivo da Campanha</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OBJECTIVES.map(obj => (
                <button
                  key={obj.id}
                  onClick={() => setObjective(obj.id)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                    objective === obj.id 
                      ? "bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10" 
                      : "bg-[var(--surface-2)] border-[var(--border-2)] hover:border-[var(--text-3)]"
                  )}
                >
                  <div className="mt-0.5">{obj.icon}</div>
                  <div className="min-w-0">
                    <p className={cn("text-[13px] font-extrabold", objective === obj.id ? "text-blue-500" : "text-[var(--text)]")}>{obj.label}</p>
                    <p className="text-[10px] font-medium text-[var(--text-3)] leading-tight mt-0.5">{obj.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Orçamento */}
          <div className="space-y-3">
            <label className="text-[12px] font-bold text-[var(--text-2)] uppercase tracking-wider ml-1 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-green-500" /> Orçamento Diário (R$)
            </label>
            <Input 
              type="number"
              value={budget} 
              onChange={(e: any) => setBudget(e.target.value)}
              className="h-14 bg-[var(--surface-2)] border-[var(--border-2)] text-[18px] font-black rounded-2xl text-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-[var(--surface-2)]/50 border-t border-[var(--border-2)] flex items-center gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] border-[var(--border-2)]">
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading}
            className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-[12px] bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/20 gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Rocket className="w-4 h-4" /> Criar Campanha</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
