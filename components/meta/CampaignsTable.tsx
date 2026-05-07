"use client";

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  ChevronDown, ChevronRight, Play, Pause, MoreHorizontal, 
  Copy, Edit2, Search, Filter, Download, Plus, Settings, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Campaign {
  id: string;
  name: string;
  status: boolean;
  budget: string;
  vendas: number;
  cpa: string;
  gastos: string;
  ic: number;
  lucro: string;
  cpi: string;
  color?: string;
}

const MOCK_DATA: Campaign[] = [
  {
    id: "c1",
    name: "CP14 - CBO - 1-5-1 - AD6 #14",
    status: true,
    budget: "R$ 800,00",
    vendas: 7,
    cpa: "R$ 49,82",
    gastos: "R$ 348,74",
    ic: 22,
    lucro: "R$ 602,28",
    cpi: "R$ 15,85",
    color: "bg-purple-500"
  },
  {
    id: "c2",
    name: "CP24 - CBO - 1-1-4 - VSL2",
    status: true,
    budget: "R$ 300,00",
    vendas: 2,
    cpa: "R$ 52,06",
    gastos: "R$ 104,11",
    ic: 12,
    lucro: "R$ 167,61",
    cpi: "R$ 8,67",
  },
  {
    id: "c3",
    name: "CP60 - CBO - 1-5-1 - AD6 #49 - Cópia",
    status: false,
    budget: "R$ 300,00",
    vendas: 2,
    cpa: "R$ 53,57",
    gastos: "R$ 107,14",
    ic: 10,
    lucro: "R$ 118,03",
    cpi: "R$ 10,71",
    color: "bg-green-500"
  },
  {
    id: "c4",
    name: "CP58 - CBO - 1-5-1 - AD6 #46",
    status: false,
    budget: "R$ 300,00",
    vendas: 1,
    cpa: "R$ 79,32",
    gastos: "R$ 79,32",
    ic: 4,
    lucro: "R$ 56,54",
    cpi: "R$ 19,83",
    color: "bg-blue-500"
  }
];

export function CampaignsTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div className="space-y-0 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Upper Toolbar (White) */}
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg border border-gray-100">
             <Settings className="w-5 h-5 text-gray-400" />
          </Button>
          <Button variant="ghost" className="h-10 gap-2 border border-gray-100 text-xs font-bold text-gray-600 px-4">
             <Edit2 className="w-4 h-4" /> Abrir no gerenciador
          </Button>
          <Button variant="ghost" className="h-10 gap-2 border border-gray-100 text-xs font-bold text-gray-600 px-4">
             <Copy className="w-4 h-4" /> Duplicar campanhas
          </Button>
          <Select>
            <SelectTrigger className="w-10 h-10 p-0 border border-gray-100 justify-center">
               <ChevronDown className="w-4 h-4 text-gray-400" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ações</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-xs font-medium text-gray-400">Atualizado há 2 minutos</span>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-10">
              Atualizar
           </Button>
        </div>
      </div>

      {/* Tabs Toolbar (Light Gray) */}
      <div className="flex items-center justify-between border-y border-gray-100 px-2 py-0">
        <div className="flex items-center">
          <button className="flex items-center gap-2 px-6 py-4 border-b-2 border-blue-600 text-blue-600 font-bold text-sm">
             <Plus className="w-4 h-4" /> Campanhas
             <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">2 selecionados</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-4 text-gray-400 font-bold text-sm hover:text-gray-600">
             <MoreHorizontal className="w-4 h-4" /> Conjuntos para 2 campanhas
          </button>
          <button className="flex items-center gap-2 px-6 py-4 text-gray-400 font-bold text-sm hover:text-gray-600">
             <MoreHorizontal className="w-4 h-4" /> Anúncios para 2 campanhas
          </button>
        </div>
      </div>

      {/* Filters Area (Gray) */}
      <div className="p-4 bg-gray-50/50 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Nome da Campanha</label>
            <Input placeholder="Filtrar por nome" className="h-10 bg-white border-gray-200 text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Status da Campanha</label>
            <Select defaultValue="any">
              <SelectTrigger className="bg-white border-gray-200 text-xs font-semibold">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Data de cadastro</label>
            <Select defaultValue="today">
              <SelectTrigger className="bg-white border-gray-200 text-xs font-semibold">
                <SelectValue placeholder="Hoje" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Conta de Anúncio</label>
            <Select defaultValue="c2">
              <SelectTrigger className="bg-white border-gray-200 text-xs font-semibold">
                <SelectValue placeholder="CONTA 02" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c2">CONTA 02</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Produto</label>
            <Select defaultValue="any">
              <SelectTrigger className="bg-white border-gray-200 text-xs font-semibold">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-200">
              <TableHead className="w-[50px] text-center"><Checkbox /></TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Campanha</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Orçamento</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Vendas</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">CPA</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Gastos</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">IC</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Lucro</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">CPI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DATA.map((campaign) => (
              <TableRow key={campaign.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="text-center"><Checkbox checked={campaign.id === 'c1' || campaign.id === 'c3'} /></TableCell>
                <TableCell>
                  <Switch checked={campaign.status} />
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-3">
                      {campaign.color && <div className={`w-3 h-3 rounded-full ${campaign.color}`} />}
                      <span className="text-sm font-bold text-gray-600">{campaign.name}</span>
                   </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                     <Edit2 className="w-3 h-3 text-gray-300" />
                     <div className="flex flex-col leading-tight">
                        <span>{campaign.budget}</span>
                        <span className="text-[9px] text-gray-300 font-medium">Diário</span>
                     </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold text-gray-600">{campaign.vendas}</TableCell>
                <TableCell className="text-right font-bold text-gray-600">{campaign.cpa}</TableCell>
                <TableCell className="text-right font-bold text-gray-600">{campaign.gastos}</TableCell>
                <TableCell className="text-center font-bold text-gray-600">{campaign.ic}</TableCell>
                <TableCell className="text-right font-bold text-green-600">{campaign.lucro}</TableCell>
                <TableCell className="text-right font-bold text-gray-400">{campaign.cpi}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot className="bg-gray-50/50">
             <TableRow className="border-none font-black text-gray-700">
                <TableCell className="text-[10px] font-black uppercase text-gray-400">N/A</TableCell>
                <TableCell className="text-[10px] font-black uppercase text-gray-400">N/A</TableCell>
                <TableCell className="text-xs font-black uppercase">17 Campanhas</TableCell>
                <TableCell className="text-xs font-black uppercase">N/A</TableCell>
                <TableCell className="text-center text-xs font-black">15</TableCell>
                <TableCell className="text-right text-xs font-black">R$ 110,94</TableCell>
                <TableCell className="text-right text-xs font-black">R$ 1.664,14</TableCell>
                <TableCell className="text-center text-xs font-black">139</TableCell>
                <TableCell className="text-right text-xs font-black text-green-600">R$ 327,21</TableCell>
                <TableCell className="text-right text-xs font-black">R$ 11,50</TableCell>
             </TableRow>
          </tfoot>
        </Table>
      </div>
    </div>
  );
}
