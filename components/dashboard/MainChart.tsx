"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

const data = [
  { date: "01/05", investment: 400, roas: 2.4 },
  { date: "02/05", investment: 300, roas: 1.3 },
  { date: "03/05", investment: 200, roas: 3.8 },
  { date: "04/05", investment: 278, roas: 3.9 },
  { date: "05/05", investment: 189, roas: 4.8 },
  { date: "06/05", investment: 239, roas: 3.8 },
  { date: "07/05", investment: 349, roas: 4.3 },
];

export function MainChart() {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Performance do Período (Investimento vs. ROAS)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "20px", fontSize: "10px", fontWeight: "black", textTransform: "uppercase", letterSpacing: "0.1em" }} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="investment" 
                name="Investimento"
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="roas" 
                name="ROAS"
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--muted-foreground))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
