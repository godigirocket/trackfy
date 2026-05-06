"use client";

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  ChevronDown, ChevronRight, Play, Pause, MoreHorizontal, 
  Copy, Edit2, ExternalLink, Search, Filter, Download, Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Campaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  results: string;
  cpl: string;
  budget: string;
  spend: string;
  impressions: string;
  roi: string;
  type: "campaign" | "adset" | "ad";
  children?: any[];
}

const MOCK_DATA: Campaign[] = [
  {
    id: "c1",
    name: "Black Friday 2024 — FASE 1",
    status: "ACTIVE",
    results: "1.240 Leads",
    cpl: "R$ 12,40",
    budget: "R$ 500,00",
    spend: "R$ 15.376,00",
    impressions: "450.000",
    roi: "4.2x",
    type: "campaign",
    children: [
      {
        id: "as1",
        name: "Lookalike 1% — Compradores",
        status: "ACTIVE",
        results: "840 Leads",
        cpl: "R$ 10,20",
        budget: "R$ 200,00",
        spend: "R$ 8.568,00",
        impressions: "200.000",
        roi: "5.1x",
        type: "adset"
      }
    ]
  },
  {
    id: "c2",
    name: "Retargeting — Carrinho Abandonado",
    status: "PAUSED",
    results: "120 Vendas",
    cpl: "R$ 45,00",
    budget: "R$ 150,00",
    spend: "R$ 5.400,00",
    impressions: "80.000",
    roi: "2.8x",
    type: "campaign"
  }
];

export function CampaignsTable() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou ID..." 
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-card border-border text-xs font-bold uppercase tracking-widest"
            />
          </div>
          <Button variant="outline" className="h-10 gap-2 text-xs font-bold uppercase tracking-widest">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 gap-2 text-xs font-bold uppercase tracking-widest">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button className="h-10 gap-2 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground">
            <Plus className="w-4 h-4" /> Criar Campanha
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[40px]">
                <Checkbox />
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12">Nome da Campanha</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12">Resultados</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-right">Custo/Res.</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-right">Orçamento</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-right">Gasto Total</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-right">ROI</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DATA.map((campaign) => (
              <>
                <TableRow key={campaign.id} className="border-border group hover:bg-muted/30">
                  <TableCell>
                    {campaign.children && (
                      <button onClick={() => toggleExpand(campaign.id)} className="p-1 hover:bg-muted rounded">
                        {expandedRows[campaign.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-tight truncate">{campaign.name}</span>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <Edit2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{campaign.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        campaign.status === "ACTIVE" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground"
                      )} />
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0",
                        campaign.status === "ACTIVE" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-muted-foreground"
                      )}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold">{campaign.results}</TableCell>
                  <TableCell className="text-xs font-bold text-right">{campaign.cpl}</TableCell>
                  <TableCell className="text-xs font-bold text-right">{campaign.budget}</TableCell>
                  <TableCell className="text-xs font-bold text-right">{campaign.spend}</TableCell>
                  <TableCell className="text-xs font-bold text-right text-emerald-500">{campaign.roi}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {campaign.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {expandedRows[campaign.id] && campaign.children?.map(adset => (
                  <TableRow key={adset.id} className="border-border bg-muted/20 hover:bg-muted/40">
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 border-l border-b border-muted-foreground/30 -mt-1 ml-[-12px]" />
                        <span className="text-[11px] font-bold text-muted-foreground italic truncate">{adset.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest scale-90 origin-left">
                        {adset.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] font-medium opacity-60">{adset.results}</TableCell>
                    <TableCell className="text-[11px] font-medium text-right opacity-60">{adset.cpl}</TableCell>
                    <TableCell className="text-[11px] font-medium text-right opacity-60">{adset.budget}</TableCell>
                    <TableCell className="text-[11px] font-medium text-right opacity-60">{adset.spend}</TableCell>
                    <TableCell className="text-[11px] font-bold text-right text-emerald-500/60">{adset.roi}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
