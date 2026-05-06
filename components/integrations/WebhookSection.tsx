"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Terminal, FlaskConical, ChevronRight } from "lucide-react";

export function WebhookSection() {
  const payloadExample = `{
  "event_type": "custom_sale",
  "timestamp": "2023-10-27T10:00:00Z",
  "data": {
    "order_id": "ORD-9982",
    "amount": 150.00,
    "currency": "BRL",
    "customer": {
      "email": "cliente@exemplo.com"
    }
  }
}`;

  return (
    <div className="space-y-6 mt-16">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Webhook Genérico (JSON)</h2>
        <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
          Integre qualquer sistema enviando payloads JSON formatados para a nossa API.
        </p>
      </div>

      <Card className="border-none bg-[#0F172A] rounded-[24px] overflow-hidden shadow-2xl">
        <CardContent className="p-0 flex flex-col md:flex-row">
          {/* Left Side - Info */}
          <div className="flex-1 p-10 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-white tracking-tighter">Endpoint Principal</h3>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#1E293B] border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                  <code className="text-emerald-400 font-mono text-sm font-bold">
                    POST <span className="text-slate-400">https://api.trackfy.io/webhooks/custom/user_abc123</span>
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white transition-all">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[400px]">
              Envie requisições HTTP POST contendo o payload no formato especificado. Autenticação via Header <code className="text-primary-foreground font-bold bg-white/5 px-1.5 py-0.5 rounded">X-API-Key</code> é obrigatória.
            </p>

            <div className="flex gap-4">
              <Button className="h-12 px-6 bg-[#0064E0] hover:bg-[#0052b8] text-white text-[12px] font-black uppercase tracking-widest rounded-xl gap-2 transition-all">
                <Terminal className="w-4 h-4" /> Ver Schema JSON
              </Button>
              <Button variant="outline" className="h-12 px-6 border-white/10 text-white hover:bg-white/5 text-[12px] font-black uppercase tracking-widest rounded-xl gap-2 transition-all">
                <FlaskConical className="w-4 h-4" /> Testar Webhook
              </Button>
            </div>
          </div>

          {/* Right Side - Code Block */}
          <div className="flex-1 bg-[#020617]/50 p-10 border-l border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exemplo de Payload</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">JSON</span>
            </div>
            <pre className="font-mono text-[13px] leading-relaxed text-slate-300">
              {payloadExample.split('\n').map((line, i) => {
                // Simple syntax highlighting simulation
                const highlightedLine = line
                  .replace(/"([^"]+)":/g, '<span class="text-slate-500">"$1":</span>')
                  .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
                  .replace(/: ([0-9.]+)/g, ': <span class="text-amber-400">$1</span>');
                
                return (
                  <div key={i} dangerouslySetInnerHTML={{ __html: highlightedLine }} />
                );
              })}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
