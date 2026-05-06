"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface CampaignEditorDrawerProps {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignEditorDrawer({ campaign, open, onOpenChange }: CampaignEditorDrawerProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    status: campaign?.status || "ACTIVE",
    budget: campaign?.budget || "0",
  });

  const handleSave = () => {
    // API call would go here
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] border-l border-border bg-card">
        <SheetHeader className="space-y-4 pb-8">
          <SheetTitle className="text-xl font-black tracking-tighter uppercase">Editar Campanha</SheetTitle>
          <SheetDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Altere as configurações principais da sua campanha no Meta Ads.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Campanha</Label>
            <Input 
              value={formData.name} 
              onChange={(e: any) => setFormData({...formData, name: e.target.value})}
              className="h-12 bg-muted/30 border-border font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="h-12 bg-muted/30 border-border font-bold">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ATIVO</SelectItem>
                  <SelectItem value="PAUSED">PAUSADO</SelectItem>
                  <SelectItem value="ARCHIVED">ARQUIVADO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Orçamento Diário</Label>
              <Input 
                type="number"
                value={formData.budget} 
                onChange={(e: any) => setFormData({...formData, budget: e.target.value})}
                className="h-12 bg-muted/30 border-border font-bold"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-1">Informação de Escala</p>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Alterações de orçamento superiores a 20% podem fazer a campanha entrar em fase de aprendizado novamente.
            </p>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-border">
          <div className="flex w-full gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-12 text-[12px] font-black uppercase tracking-widest">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 h-12 bg-primary text-primary-foreground text-[12px] font-black uppercase tracking-widest">
              Salvar Alterações
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
