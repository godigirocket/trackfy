"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

export function PDFExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info("Gerando relatório, aguarde...", { id: "pdf-toast" });

      // O container principal do dashboard (precisa ter o ID #dashboard-content ou capturar a div principal)
      const element = document.getElementById("dashboard-content") || document.body;
      
      const canvas = await html2canvas(element, {
        scale: 2, // Maior resolução
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0a0a0b" : "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Criar PDF em formato A4
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`trackfy-report-${new Date().toISOString().split("T")[0]}.pdf`);

      toast.success("Relatório gerado com sucesso!", { id: "pdf-toast" });
    } catch (error) {
      console.error(error);
      toast.error("Falha ao gerar o relatório.", { id: "pdf-toast" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      variant="outline" 
      className="h-10 gap-2 border-primary/20 text-primary hover:bg-primary/10 transition-all text-xs font-black uppercase tracking-widest rounded-xl"
    >
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Exportar PDF
    </Button>
  );
}
