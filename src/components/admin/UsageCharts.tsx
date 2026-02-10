import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface UsageChartsProps {
  conversasPorDia: Record<string, number>;
  conversasPorModo: Record<string, number>;
}

const MODO_LABELS: Record<string, string> = {
  livre: "Livre",
  mensagem: "Mensagem",
  exegese: "Exegese",
  devocional: "Devocional",
  academico: "Acadêmico",
};

const COLORS = [
  "hsl(43, 91%, 38%)",
  "hsl(215, 28%, 40%)",
  "hsl(43, 70%, 55%)",
  "hsl(210, 14%, 50%)",
  "hsl(43, 95%, 28%)",
];

export function UsageCharts({ conversasPorDia, conversasPorModo }: UsageChartsProps) {
  const barData = Object.entries(conversasPorDia)
    .slice(-14)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      conversas: count,
    }));

  const pieData = Object.entries(conversasPorModo).map(([modo, count]) => ({
    name: MODO_LABELS[modo] || modo,
    value: count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversas por dia (últimos 14 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="conversas" fill="hsl(43, 91%, 38%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Sem dados no período</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por modo</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
