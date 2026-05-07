"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const stats = [
  { label: "Faturamento Líquido", value: "R$ 635.789,23", info: true },
  { label: "Gastos com anúncios", value: "R$ 456.827,90", info: true },
  { label: "ROAS", value: "1.39", color: "text-green-600", info: true },
  { label: "Lucro", value: "R$ 159.887,65", color: "text-green-600", info: true },
];

const subStats = [
  { label: "Vendas Pendentes", value: "R$ 89.289,38" },
  { label: "ROI", value: "35.0%", color: "text-green-600", info: true },
  { label: "Margem de Lucro", value: "25.1%", color: "text-green-600" },
  { label: "Vendas Reembolsadas", value: "R$ 18.459,20" },
  { label: "Reembolso", value: "2.4%", info: true },
  { label: "ARPU", value: "R$ 238,79", info: true },
  { label: "Imposto", value: "R$ 19.073,68", info: true },
  { label: "Chargeback", value: "0.7%" },
];

const paymentData = [
  { name: 'Pix', value: 48, color: '#3B82F6' },
  { name: 'Cartão', value: 27, color: '#60A5FA' },
  { name: 'Boleto', value: 15, color: '#FBBF24' },
  { name: 'Outros', value: 8, color: '#EF4444' },
];

export default function DashboardUtmifyPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Resumo Bar */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-6 border-b border-gray-100">
          <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-tight">Resumo</CardTitle>
          <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
            <span>Atualizado há 1 minuto</span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Data de cadastro</label>
              <Select defaultValue="7d">
                <SelectTrigger className="bg-white border-gray-200 text-xs font-semibold">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Conta de Anúncio</label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-white border-gray-200 text-xs font-semibold">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Plataforma</label>
              <Select defaultValue="any">
                <SelectTrigger className="bg-white border-gray-200 text-xs font-semibold">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Produto</label>
              <Select defaultValue="any">
                <SelectTrigger className="bg-white border-gray-200 text-xs font-semibold">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Top 4 Cards */}
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-white">
              <CardContent className="p-6 flex flex-col gap-2 relative">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{stat.label}</span>
                  {stat.info && <Info size={14} className="text-gray-300" />}
                </div>
                <span className={`text-2xl font-black ${stat.color || 'text-gray-900'}`}>{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Left Side: Payment Chart */}
        <div className="md:col-span-4 h-full">
          <Card className="border-none shadow-sm bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-tight">Vendas por Pagamento</CardTitle>
              <Info size={14} className="text-gray-300" />
            </CardHeader>
            <CardContent className="h-[300px] flex flex-col items-center justify-center pt-0">
              <div className="relative w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
                  <p className="text-xl font-black text-gray-800">2867</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 w-full mt-2">
                 {paymentData.map((item) => (
                   <div key={item.name} className="flex flex-col items-center gap-1">
                     <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold text-gray-500">{item.name}</span>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Sub Stats Grid */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {subStats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-white">
              <CardContent className="p-6 flex flex-col gap-1 relative">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{stat.label}</span>
                  {stat.info && <Info size={14} className="text-gray-300" />}
                </div>
                <span className={`text-lg font-black ${stat.color || 'text-gray-900'}`}>{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
