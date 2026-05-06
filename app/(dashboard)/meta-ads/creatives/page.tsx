import { CreativeCard } from "@/components/meta/CreativeCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, LayoutGrid, List } from "lucide-react";

const MOCK_CREATIVES = [
  { id: "cr1", name: "Video VSL — Amarelo", thumb: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop", spend: "R$ 4.500,00", results: "320", cpl: "R$ 14,06", hookRate: "42%", status: "ACTIVE" },
  { id: "cr2", name: "Estático — Prova Social", thumb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop", spend: "R$ 1.200,00", results: "85", cpl: "R$ 14,11", status: "ACTIVE" },
  { id: "cr3", name: "Carrossel — Funcionalidades", thumb: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop", spend: "R$ 800,00", results: "42", cpl: "R$ 19,04", status: "PAUSED" },
  { id: "cr4", name: "UGC — Depoimento Maria", thumb: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=400&fit=crop", spend: "R$ 2.300,00", results: "180", cpl: "R$ 12,77", hookRate: "38%", status: "ACTIVE" },
];

export default function CreativesPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Hub de Criativos 🎬</h1>
          <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
            Analise a performance visual e encontre seus novos ganhadores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-xl overflow-hidden p-1 bg-card">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-muted text-primary"><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><List className="w-4 h-4" /></Button>
          </div>
          <Button variant="outline" className="h-10 gap-2 text-xs font-bold uppercase tracking-widest"><Filter className="w-4 h-4" /> Filtros</Button>
          <Button variant="outline" className="h-10 gap-2 text-xs font-bold uppercase tracking-widest"><RefreshCw className="w-4 h-4" /> Atualizar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_CREATIVES.map(cr => (
          <CreativeCard key={cr.id} creative={cr} />
        ))}
      </div>
    </div>
  );
}
