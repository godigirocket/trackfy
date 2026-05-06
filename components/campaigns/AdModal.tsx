"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { 
  formatCurrency, 
  extractMetric,
  LEAD_ACTION_TYPES,
  CONVERSATION_ACTION_TYPES 
} from "@/lib/formatters";
import { 
  Loader2, 
  ImageIcon, 
  ExternalLink,
  Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdModalProps {
  id: string;
  name: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdModal({ id, name, isOpen, onClose }: AdModalProps) {
  const { metaToken, period } = useAppStore();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && id && metaToken) {
      fetchAds();
    }
  }, [isOpen, id, metaToken]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meta/insights?campaign_id=${id}&period=${period}`);
      const data = await res.json();
      setAds(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar anúncios:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border bg-muted/30">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl font-black tracking-tighter uppercase">{name}</DialogTitle>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID: {id}</p>
          </div>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Analisando Anúncios...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => {
                const leads = extractMetric(ad.actions, LEAD_ACTION_TYPES);
                const spend = parseFloat(ad.spend || "0");
                const cpl = leads > 0 ? spend / leads : 0;

                return (
                  <Card key={ad.ad_id} className="border-border bg-muted/10 overflow-hidden flex flex-col group transition-all hover:border-primary/30">
                    <div className="aspect-square bg-muted relative overflow-hidden">
                       <ImageIcon className="absolute inset-0 m-auto w-8 h-8 text-muted-foreground/20" />
                       <Badge className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-[8px] font-black uppercase tracking-widest border-none">
                         {ad.adset_name}
                       </Badge>
                    </div>
                    <div className="p-4 space-y-4 flex-1 flex flex-col">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black tracking-tight truncate uppercase">{ad.ad_name}</h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{ad.ad_id}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Investido</p>
                          <p className="text-xs font-black">{formatCurrency(spend)}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Leads</p>
                          <p className="text-xs font-black text-primary">{leads}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between">
                         <div className="space-y-0.5">
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">CPL</p>
                           <p className="text-sm font-black text-emerald-500">{formatCurrency(cpl)}</p>
                         </div>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-all">
                           <ExternalLink className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {ads.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-3 opacity-30">
                  <Info className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-xs font-black uppercase tracking-widest">Nenhum anúncio encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border", className)}>{children}</div>;
}
