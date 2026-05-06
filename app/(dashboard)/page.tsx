import { MetricCard } from "@/components/dashboard/MetricCard";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFExportButton } from "@/components/reports/PDFExportButton";

export default function DashboardPage() {
  return (
    <div id="dashboard-content" className="space-y-10 pb-20 p-4 -m-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Marketing Command Center 🕹️</h1>
          <p className="text-[14px] font-bold text-muted-foreground uppercase tracking-widest">
            Visão geral da sua operação de vendas e anúncios em tempo real.
          </p>
        </div>
        <PDFExportButton />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-12">
          <ExecutiveSummary />
        </div>

        <div className="xl:col-span-3 lg:col-span-6">
          <MetricCard 
            title="Investimento Total" 
            value="12.450,80" 
            prefix="R$"
            variation="15%" 
            isPositive={false} 
          />
        </div>
        <div className="xl:col-span-3 lg:col-span-6">
          <MetricCard 
            title="Vendas Realizadas" 
            value="45.120,00" 
            prefix="R$"
            variation="24%" 
            isPositive={true} 
          />
        </div>
        <div className="xl:col-span-3 lg:col-span-6">
          <MetricCard 
            title="ROAS Consolidado" 
            value="3.62" 
            variation="8%" 
            isPositive={true} 
          />
        </div>
        <div className="xl:col-span-3 lg:col-span-6">
          <MetricCard 
            title="Custo por Lead" 
            value="14.20" 
            prefix="R$"
            variation="12%" 
            isPositive={true} 
          />
        </div>

        <div className="xl:col-span-8 lg:col-span-12">
          <Card className="border-border bg-card enterprise-shadow h-[400px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Performance Semanal</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Vendas</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gasto</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center border-t border-border/50">
              <div className="flex flex-col items-center gap-4 opacity-20">
                <BarChart3 size={64} className="text-muted-foreground" />
                <p className="text-xs font-black uppercase tracking-widest">Gráfico de Performance em Desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4 lg:col-span-12">
          <Card className="border-border bg-card enterprise-shadow h-[400px]">
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Top Canais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: "Facebook Ads", value: "R$ 8.450", color: "bg-[#1877F2]", percent: 65 },
                { name: "Google Ads", value: "R$ 3.120", color: "bg-[#4285F4]", percent: 25 },
                { name: "TikTok Ads", value: "R$ 880", color: "bg-[#000000]", percent: 10 }
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-tight">{item.name}</span>
                    <span className="text-xs font-black">{item.value}</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
