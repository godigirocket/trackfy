"use client";

import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Plus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

const MOCK_GOOGLE = [
  { id: "g1", name: "Search — Fundo de Funil", status: "ENABLED", type: "SEARCH", budget: "R$ 300,00", impressions: "12.000", clicks: "1.200", ctr: "10.0%", cost: "R$ 4.500,00", conv: "150", roas: "5.2x" },
  { id: "g2", name: "PMax — Performance Max", status: "ENABLED", type: "PMAX", budget: "R$ 1.000,00", impressions: "450.000", clicks: "4.500", ctr: "1.0%", cost: "R$ 12.000,00", conv: "320", roas: "3.8x" },
];

export function GoogleCampaignsTable() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar campanhas Google..." className="pl-10 h-10 bg-card border-border text-xs font-bold uppercase tracking-widest" />
          </div>
          <Button variant="outline" className="h-10 gap-2 text-xs font-bold uppercase tracking-widest"><Filter className="w-4 h-4" /> Filtros</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 gap-2 text-xs font-bold uppercase tracking-widest"><Download className="w-4 h-4" /> Exportar</Button>
          <Button className="h-10 gap-2 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground"><Plus className="w-4 h-4" /> Nova Campanha Google</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12">Nome da Campanha</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12">Tipo</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-right">Custo</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-right">Cliques</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-right">Conv.</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-right">ROAS</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_GOOGLE.map((c) => (
              <TableRow key={c.id} className="border-border group hover:bg-muted/30">
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black tracking-tight">{c.name}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{c.id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-emerald-500 border-emerald-500/20 bg-emerald-500/5">{c.status}</Badge>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-[8px] font-bold uppercase tracking-widest">{c.type}</Badge></TableCell>
                <TableCell className="text-xs font-bold text-right">{c.cost}</TableCell>
                <TableCell className="text-xs font-bold text-right">{c.clicks}</TableCell>
                <TableCell className="text-xs font-bold text-right">{c.conv}</TableCell>
                <TableCell className="text-xs font-bold text-right text-emerald-500">{c.roas}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
