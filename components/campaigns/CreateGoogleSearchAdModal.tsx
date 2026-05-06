"use client";

import { useState } from "react";
import { X, Search, Sparkles, Loader2, Target, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface CreateGoogleSearchAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGoogleSearchAdModal({ isOpen, onClose }: CreateGoogleSearchAdModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!name) return toast("Defina um nome ou nicho para a IA analisar", "error");
    setIsSuggesting(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        body: JSON.stringify({
          prompt: `Sugira 10 palavras-chave de alta conversão para uma campanha de Google Search Ads chamada "${name}". Retorne apenas as palavras separadas por vírgula.`
        })
      });
      const data = await res.json();
      if (data.text) {
        const suggested = data.text.split(",").map((s: string) => s.trim().toLowerCase());
        setKeywords(prev => Array.from(new Set([...prev, ...suggested])));
        toast("IA gerou sugestões vencedoras! 🚀", "success");
      }
    } catch (e) {
      toast("Erro ao gerar sugestões", "error");
    } finally {
      setIsSuggesting(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword.toLowerCase())) {
      setKeywords([...keywords, newKeyword.toLowerCase()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    // Simulating API call
    await new Promise(r => setTimeout(r, 2000));
    setIsCreating(false);
    toast("Campanha de Search enviada para o Google! 🟠", "success");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl glass rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Criar Google Search Ad</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Configuração de Rede de Pesquisa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Nome da Campanha</label>
                <input 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: [Pesquisa] - Vendas Diretas - Março"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-[15px] font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Orçamento Diário (R$)</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black">R$</div>
                   <input 
                     type="number"
                     value={budget}
                     onChange={e => setBudget(e.target.value)}
                     placeholder="0,00"
                     className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-[15px] font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all"
                   />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                <Target className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div className="space-y-1">
                   <p className="text-[13px] font-black text-white uppercase italic">Sugestão de Estratégia</p>
                   <p className="text-[11px] text-white/40 font-medium leading-relaxed">Para novos anúncios de pesquisa, recomendamos começar com Maximizar Cliques para coletar dados iniciais de CTR.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Palavras-chave</label>
                  <button 
                    onClick={handleSuggest}
                    disabled={isSuggesting}
                    className="flex items-center gap-2 text-[11px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors disabled:opacity-40"
                  >
                    {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Sugestão de IA
                  </button>
               </div>

               <div className="flex gap-2">
                  <input 
                    value={newKeyword}
                    onChange={e => setNewKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addKeyword()}
                    placeholder="Adicionar keyword manual..."
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-[13px] font-bold text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <button onClick={addKeyword} className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex flex-wrap gap-2">
                  {keywords.length === 0 ? (
                    <div className="w-full py-12 text-center glass rounded-3xl border-dashed border-white/10 opacity-20">
                       <p className="text-[11px] font-black uppercase tracking-widest italic">Nenhuma palavra-chave definida</p>
                    </div>
                  ) : keywords.map(kw => (
                    <div key={kw} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg group animate-in zoom-in-90">
                       <span className="text-[12px] font-bold text-white/60">{kw}</span>
                       <button onClick={() => removeKeyword(kw)} className="text-white/20 hover:text-rose-500 transition-colors">
                          <X className="w-3 h-3" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
           <div className="flex gap-2">
              <div className={cn("w-2 h-2 rounded-full transition-all", step === 1 ? "bg-amber-500 w-6" : "bg-white/10")} />
              <div className={cn("w-2 h-2 rounded-full transition-all", step === 2 ? "bg-amber-500 w-6" : "bg-white/10")} />
           </div>
           
           <div className="flex items-center gap-4">
             {step === 1 ? (
               <button onClick={() => setStep(2)} disabled={!name || !budget}
                 className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-40">
                 Próximo Passo
               </button>
             ) : (
               <>
                 <button onClick={() => setStep(1)} className="px-6 py-3 bg-white/5 text-white/40 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                   Voltar
                 </button>
                 <button onClick={handleCreate} disabled={isCreating || keywords.length === 0}
                   className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-40">
                   {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                   Finalizar Campanha
                 </button>
               </>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
