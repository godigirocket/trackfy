import { CSVUpload } from "@/components/finance/CSVUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, ShoppingBag, Receipt } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Módulo Financeiro 💰</h1>
        <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
          Analise seu lucro real cruzando dados de anúncios e vendas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CSVUpload />
          
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Últimas Transações Importadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-30">
                <Receipt className="w-10 h-10 text-muted-foreground" />
                <p className="text-xs font-bold uppercase tracking-widest">Nenhuma transação encontrada.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-primary/5">
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Resumo do Mês</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Receita Bruta</p>
                    <p className="text-lg font-black tracking-tight">R$ 0,00</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gasto Total Anúncios</p>
                    <p className="text-lg font-black tracking-tight">R$ 12.450,00</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-black text-foreground uppercase tracking-widest">Lucro Estimado</p>
                  <p className="text-2xl font-black tracking-tighter text-rose-500">- R$ 12.450,00</p>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 text-right">Aguardando importação de vendas</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
