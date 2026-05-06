"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  name: string;
  description: string;
  logo: string;
  webhookUrl: string;
  supportedEvents: string[];
  status?: "Ativo" | "Inativo";
  color?: string;
}

export function IntegrationCard({
  name,
  description,
  logo,
  webhookUrl,
  supportedEvents,
  status,
  color = "bg-primary/10"
}: IntegrationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border bg-card enterprise-shadow group overflow-hidden flex flex-col h-full transition-all hover:border-primary/30">
      <CardContent className="p-6 flex-1 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner", color)}>
              {logo}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tighter text-foreground">{name}</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed max-w-[200px]">
                {description}
              </p>
            </div>
          </div>
          {status === "Ativo" && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
              Ativo
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL do Webhook</label>
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-muted/30 border border-border rounded-xl px-3 flex items-center overflow-hidden">
              <span className="text-[10px] font-mono text-muted-foreground truncate">{webhookUrl}</span>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopy}
              className="h-10 w-10 border-border bg-background hover:bg-muted transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Eventos Suportados</label>
          <div className="flex flex-wrap gap-2">
            {supportedEvents.map((event) => (
              <Badge key={event} variant="secondary" className="bg-muted/50 text-[9px] font-bold py-0.5 px-2 rounded-lg border-none">
                {event}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button className="flex-1 h-11 bg-[#0064E0] hover:bg-[#0052b8] text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/10">
          Configurar
        </Button>
        <Button variant="outline" className="flex-1 h-11 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all">
          Manual Técnico
        </Button>
      </CardFooter>
    </Card>
  );
}
