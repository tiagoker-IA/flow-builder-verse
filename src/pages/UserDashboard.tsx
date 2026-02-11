import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, MessagesSquare, Clock, BarChart3, Search, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats, PeriodoFiltro } from "@/hooks/useUserStats";
import { MODOS_CHAT } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const PIE_COLORS = [
  "hsl(43, 91%, 38%)",
  "hsl(215, 28%, 40%)",
  "hsl(0, 84%, 60%)",
  "hsl(142, 60%, 40%)",
  "hsl(262, 60%, 50%)",
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("30d");
  const [modoFilter, setModoFilter] = useState("all");
  const [busca, setBusca] = useState("");
  const { stats, conversasFiltradas, loading } = useUserStats(periodo, modoFilter, busca);

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const pieData = Object.entries(stats.porModo).map(([modo, count]) => {
    const info = MODOS_CHAT.find(m => m.value === modo);
    return { name: info?.label || modo, value: count };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif text-xl font-medium">Meu Dashboard</h1>
              <p className="text-xs text-muted-foreground">Visão geral das suas conversas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoFiltro)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={<MessageSquare className="w-5 h-5" />} label="Total de Conversas" value={loading ? null : String(stats.total)} />
          <KPICard icon={<MessagesSquare className="w-5 h-5" />} label="Total de Mensagens" value={loading ? null : String(stats.totalMensagens)} />
          <KPICard icon={<BarChart3 className="w-5 h-5" />} label="Modos Usados" value={loading ? null : String(Object.keys(stats.porModo).length)} />
          <KPICard
            icon={<Clock className="w-5 h-5" />}
            label="Última Atividade"
            value={loading ? null : stats.ultimaAtividade
              ? formatDistanceToNow(new Date(stats.ultimaAtividade), { addSuffix: true, locale: ptBR })
              : "Nenhuma"
            }
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Line chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversas ao longo do tempo</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : stats.atividadePorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.atividadePorDia}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="data" className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                    <Line type="monotone" dataKey="conversas" stroke="hsl(43, 91%, 38%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Sem dados no período</div>
              )}
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversas por Modo</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bar chart - messages per mode */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversas por Modo (barras)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="value" fill="hsl(43, 91%, 38%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
            )}
          </CardContent>
        </Card>

        {/* Recent conversations table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversas Recentes</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    className="pl-8 h-9 w-[180px]"
                  />
                </div>
                <Select value={modoFilter} onValueChange={setModoFilter}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Filtrar modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {MODOS_CHAT.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : conversasFiltradas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma conversa encontrada</p>
            ) : (
              <div className="space-y-1">
                {conversasFiltradas.slice(0, 20).map(c => {
                  const modoInfo = MODOS_CHAT.find(m => m.value === c.modo);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                      onClick={() => navigate("/app")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {modoInfo && <modoInfo.icon className={`w-4 h-4 shrink-0 ${modoInfo.color}`} />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {modoInfo?.label} · {c.mensagens_count} msgs · {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{icon}</div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {value === null ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <p className="text-lg font-semibold truncate">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
