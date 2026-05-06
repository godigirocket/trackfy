"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link as LinkIcon, RefreshCw, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UtmGenerator() {
  const [url, setUrl] = useState("");
  const [utm, setUtm] = useState({
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: ""
  });
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = () => {
    if (!url) return "";
    try {
      const baseUrl = new URL(url);
      if (utm.source) baseUrl.searchParams.set("utm_source", utm.source);
      if (utm.medium) baseUrl.searchParams.set("utm_medium", utm.medium);
      if (utm.campaign) baseUrl.searchParams.set("utm_campaign", utm.campaign);
      if (utm.term) baseUrl.searchParams.set("utm_term", utm.term);
      if (utm.content) baseUrl.searchParams.set("utm_content", utm.content);
      return baseUrl.toString();
    } catch {
      return "URL Inválida";
    }
  };

  const handleCopy = () => {
    const text = fullUrl();
    if (!text || text === "URL Inválida") return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copiado!", description: "Link com UTM pronto para uso." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Parâmetros UTM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL de Destino</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="https://suapagina.com.br" 
                value={url}
                onChange={(e: any) => setUrl(e.target.value)}
                className="h-12 bg-muted/30 border-border font-bold pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fonte (utm_source)</Label>
              <Input placeholder="ex: facebook" value={utm.source} onChange={(e: any) => setUtm({...utm, source: e.target.value})} className="h-10 bg-muted/30 border-border text-xs font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meio (utm_medium)</Label>
              <Input placeholder="ex: cpc" value={utm.medium} onChange={(e: any) => setUtm({...utm, medium: e.target.value})} className="h-10 bg-muted/30 border-border text-xs font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Campanha (utm_campaign)</Label>
              <Input placeholder="ex: blackfriday" value={utm.campaign} onChange={(e: any) => setUtm({...utm, campaign: e.target.value})} className="h-10 bg-muted/30 border-border text-xs font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Termo (utm_term)</Label>
              <Input placeholder="ex: lookalike" value={utm.term} onChange={(e: any) => setUtm({...utm, term: e.target.value})} className="h-10 bg-muted/30 border-border text-xs font-bold" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conteúdo (utm_content)</Label>
            <Input placeholder="ex: video_vsl" value={utm.content} onChange={(e: any) => setUtm({...utm, content: e.target.value})} className="h-10 bg-muted/30 border-border text-xs font-bold" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-primary/5 flex flex-col">
        <CardHeader>
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Resultado Final</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center space-y-6">
          <div className="bg-muted/50 border border-border rounded-2xl p-6 min-h-[120px] flex items-center justify-center break-all text-center">
            {url ? (
              <p className="text-xs font-mono font-bold text-primary leading-relaxed">{fullUrl()}</p>
            ) : (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aguardando URL base...</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => { setUrl(""); setUtm({ source: "", medium: "", campaign: "", term: "", content: "" }) }}
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Limpar
            </Button>
            <Button 
              onClick={handleCopy}
              disabled={!url || fullUrl() === "URL Inválida"}
              className="flex-1 h-12 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar URL"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
