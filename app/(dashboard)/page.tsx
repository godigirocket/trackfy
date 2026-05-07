"use client";

import { useAppStore } from "@/store/useAppStore";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  ChevronDown, ChevronRight, Edit2, Power, 
  ExternalLink, TrendingUp, Info, Play, Pause, MoreHorizontal, Layout
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { updateCampaign } from "@/hooks/useMetaData";

export default function DashboardPage() {
  const { dataA, hierarchy, isLoading } = useAppStore();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await updateCampaign(id, { status: newStatus });
  };

  if (!mounted) return <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Marketing Manager 🕹️</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Controle total das suas campanhas do Meta Ads em tempo real.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-card/30 backdrop-blur-sm overflow-hidden enterprise-shadow">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] h-14">Campanha</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] h-14">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] h-14">Resultados</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] h-14 text-right">Custo/Res.</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] h-14 text-right">Orçamento</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] h-14 text-right">Gasto Total</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] h-14 text-right">ROI</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] h-14 w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell colSpan={9}><Skeleton className="h-12 w-full opacity-10" /></TableCell>
                </TableRow>
              ))
            ) : hierarchy?.campaigns.map((campaign: any) => {
              const metrics = dataA.filter(d => d.campaign_id === campaign.id);
              const totalSpend = metrics.reduce((s, m) => s + parseFloat(m.spend || "0"), 0);
              const totalLeads = metrics.reduce((s, m) => s + (m.actions?.find((a:any) => a.action_type === 'lead')?.value || 0), 0);
              const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
              
              const isExpanded = expandedRows[campaign.id];

              return (
                <>
                  <TableRow key={campaign.id} className="border-white/5 group hover:bg-white/[0.02] transition-all">
                    <TableCell>
                      <button 
                        onClick={() => toggleExpand(campaign.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-white truncate group-hover:text-primary transition-colors">{campaign.name}</span>
                           <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-all">
                             <Edit2 className="w-3 h-3" />
                           </button>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">ID: {campaign.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          campaign.status === "ACTIVE" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-zinc-600"
                        )} />
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0 border-none",
                          campaign.status === "ACTIVE" ? "text-green-500 bg-green-500/10" : "text-zinc-500 bg-zinc-500/10"
                        )}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-black text-white">
                        {totalLeads} <span className="text-[10px] text-muted-foreground font-bold ml-1 uppercase">Leads</span>
                    </TableCell>
                    <TableCell className="text-xs font-black text-white text-right">
                        R$ {avgCpl.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-white">R$ {parseFloat(campaign.daily_budget || campaign.lifetime_budget || "0").toLocaleString("pt-BR")}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{campaign.daily_budget ? 'Diário' : 'Vitalício'}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-xs font-black text-white text-right">
                        R$ {totalSpend.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs font-black text-right">
                        <span className="text-green-400">4.2x</span>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                                onClick={() => handleStatusToggle(campaign.id, campaign.status)}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    campaign.status === "ACTIVE" ? "hover:bg-red-500/10 text-zinc-400 hover:text-red-500" : "hover:bg-green-500/10 text-zinc-400 hover:text-green-500"
                                )}
                            >
                                <Power className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </TableCell>
                  </TableRow>
                  
                  {isExpanded && hierarchy.adsets.filter((as:any) => as.campaign_id === campaign.id).map((adset: any) => (
                    <TableRow key={adset.id} className="bg-white/[0.01] border-white/5 hover:bg-white/[0.03]">
                      <TableCell></TableCell>
                      <TableCell className="pl-8">
                        <div className="flex flex-col border-l-2 border-white/5 pl-4 py-1">
                          <span className="text-[12px] font-bold text-muted-foreground">{adset.name}</span>
                          <span className="text-[8px] font-bold text-muted-foreground/40 uppercase">CONJUNTO • {adset.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="ghost" className="text-[8px] font-bold uppercase tracking-widest scale-90">{adset.status}</Badge>
                      </TableCell>
                      <TableCell colSpan={6}></TableCell>
                    </TableRow>
                  ))}
                </>
              );
            })}
          </TableBody>
        </Table>
        
        {(!isLoading && (!hierarchy || hierarchy.campaigns.length === 0)) && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                <Layout className="w-8 h-8 text-muted-foreground" />
             </div>
             <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Nenhuma campanha encontrada</h3>
                <p className="text-xs text-muted-foreground mt-1">Conecte sua conta do Meta Ads nas configurações para começar.</p>
             </div>
             <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-8" asChild>
                <Link href="/settings">Configurar Conta</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
