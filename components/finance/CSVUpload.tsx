"use client";

import { useState } from "react";
import { Upload, FileText, Check, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    // Real implementation would use papaparse
    setTimeout(() => {
      setUploading(false);
      setFile(null);
      toast({
        title: "Sucesso!",
        description: "Seus dados de vendas foram processados.",
      });
    }, 2000);
  };

  return (
    <Card className="p-8 border-dashed border-2 border-border bg-muted/10 hover:bg-muted/20 transition-all group relative overflow-hidden">
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        {!file ? (
          <>
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black tracking-tight uppercase">Arraste seu arquivo CSV</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Importe dados de vendas para calcular ROI e Lucro Real
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black tracking-tight uppercase truncate max-w-[200px]">{file.name}</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-1">
                <Check className="w-3 h-3" /> Arquivo pronto para importar
              </p>
            </div>
            <div className="flex gap-2 relative z-20">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remover
              </Button>
              <Button 
                size="sm" 
                disabled={uploading}
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                className="h-9 px-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
              >
                {uploading ? "Processando..." : "Confirmar Importação"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
