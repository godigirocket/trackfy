"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Key, 
  ShieldCheck, 
  ExternalLink, 
  Save, 
  AlertCircle,
  RefreshCw,
  Layout
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { metaToken, setMetaToken, accountId, setAccountId } = useAppStore();
  const [token, setToken] = useState("");
  const [accId, setAccId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setToken(metaToken || "");
    setAccId(accountId || "");
  }, [metaToken, accountId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      setMetaToken(token);
      setAccountId(accId);
      localStorage.setItem("meta_token", token);
      localStorage.setItem("meta_account_id", accId);
      
      toast.success("Configurações salvas com sucesso!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Configurações ⚙️</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
          Conecte sua conta do Meta Ads e gerencie suas chaves de acesso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-8">
          <Card className="border-white/5 bg-card/30 backdrop-blur-xl rounded-3xl enterprise-shadow overflow-hidden">
            <CardHeader className="bg-white/5 p-8 border-b border-white/5">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                  <Layout className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <CardTitle className="text-lg font-black text-white uppercase tracking-tight">Meta Ads API</CardTitle>
                   <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Integração Direta com o Business Manager</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Access Token (User)</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password"
                    placeholder="EAAW..." 
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="pl-12 h-14 bg-black/40 border-white/5 rounded-2xl focus:border-primary/50 transition-all font-mono text-sm"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/60 italic pl-1 flex items-center gap-2">
                   <AlertCircle className="w-3 h-3" />
                   Gere seu token no Portal de Desenvolvedores da Meta.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Ad Account ID</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="act_123456789..." 
                    value={accId}
                    onChange={(e) => setAccId(e.target.value)}
                    className="pl-12 h-14 bg-black/40 border-white/5 rounded-2xl focus:border-primary/50 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest transition-all shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] active:scale-[0.98]"
                >
                  {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                  {isSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Como configurar?
            </h4>
            <div className="space-y-3">
               {[
                 "Acesse Meta for Developers",
                 "Crie um Aplicativo (Business)",
                 "Vá em Ferramentas → Graph API Explorer",
                 "Selecione as permissões ads_management, ads_read, read_insights",
                 "Copie o Access Token gerado"
               ].map((step, i) => (
                 <div key={i} className="flex gap-3 items-start">
                    <span className="text-[10px] font-black text-primary bg-primary/20 w-5 h-5 rounded-lg flex items-center justify-center shrink-0">{i+1}</span>
                    <span className="text-[11px] text-muted-foreground font-bold leading-tight">{step}</span>
                 </div>
               ))}
            </div>
            <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-tighter" asChild>
               <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                 Acessar Portal <ExternalLink className="w-3 h-3" />
               </a>
            </Button>
          </div>

          <div className="p-6 rounded-3xl bg-black/20 border border-white/5 flex flex-col items-center text-center space-y-2">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-muted-foreground" />
             </div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Token Status</p>
             <p className={cn(
                 "text-xs font-bold px-3 py-1 rounded-full",
                 metaToken ? "text-green-500 bg-green-500/10" : "text-zinc-500 bg-zinc-500/10"
             )}>
                {metaToken ? "TOKEN CONFIGURADO" : "AGUARDANDO TOKEN"}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
