"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BrainCircuit, ArrowUpRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExecutiveSummary() {
  return (
    <Card className="border-none bg-gradient-to-br from-[#0064E0] to-[#7C3AED] text-white shadow-xl shadow-blue-500/20 overflow-hidden relative group">
      {/* Decorative Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl transition-all duration-700 group-hover:scale-110" />
      <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Resumo Executivo (IA)</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            Ver Detalhes <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-3xl font-black tracking-tighter leading-none">
            Sua performance cresceu <span className="text-emerald-300">12.5%</span> esta semana.
          </h3>
          <p className="text-sm font-medium text-white/80 leading-relaxed max-w-[500px]">
            O aumento nas conversões foi impulsionado pela campanha <span className="text-white font-black underline decoration-2 underline-offset-4 decoration-emerald-300">Black Friday — Meta</span>, 
            que reduziu o CPL em 18% mantendo a taxa de clique (CTR) estável. Recomendamos escalar o orçamento em 15% nos próximos 3 dias.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-3 transition-all hover:bg-white/20 cursor-default">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Escalar orçamento</span>
          </div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-3 transition-all hover:bg-white/20 cursor-default">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest">Ajustar Criativos</span>
          </div>
        </div>
      </CardContent>

      <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
        <BrainCircuit size={200} />
      </div>
    </Card>
  );
}
