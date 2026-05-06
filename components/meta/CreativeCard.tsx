"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, Download, MessageSquare } from "lucide-react";

interface CreativeCardProps {
  creative: {
    id: string;
    name: string;
    thumb: string;
    spend: string;
    results: string;
    cpl: string;
    hookRate?: string;
    status: string;
  };
}

export function CreativeCard({ creative }: CreativeCardProps) {
  return (
    <Card className="border-border bg-card group overflow-hidden hover:border-primary/30 transition-all">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img 
          src={creative.thumb} 
          alt={creative.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="flex w-full gap-2">
            <Button variant="secondary" size="sm" className="flex-1 h-9 text-[10px] font-black uppercase tracking-widest gap-2">
              <Eye className="w-3.5 h-3.5" /> Detalhes
            </Button>
            <Button variant="secondary" size="icon" className="h-9 w-9">
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <Badge className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-[8px] font-black uppercase tracking-widest border-white/10">
          {creative.status}
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-4">
        <div>
          <h4 className="text-xs font-black tracking-tight truncate uppercase">{creative.name}</h4>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{creative.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Gasto</p>
            <p className="text-xs font-black">{creative.spend}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Conversas</p>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-primary" />
              <p className="text-xs font-black">{creative.results}</p>
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">CPL</p>
            <p className="text-xs font-black text-rose-500">{creative.cpl}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Hook Rate</p>
            <p className="text-xs font-black text-emerald-500">{creative.hookRate || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
