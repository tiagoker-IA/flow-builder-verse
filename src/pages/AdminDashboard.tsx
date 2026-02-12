import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCards } from "@/components/admin/StatsCards";
import { BehaviorCards } from "@/components/admin/BehaviorCards";
import { UsageCharts } from "@/components/admin/UsageCharts";
import { UsersTable } from "@/components/admin/UsersTable";
import { FeedbacksTable } from "@/components/admin/FeedbacksTable";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { CampaignList } from "@/components/admin/CampaignList";
import { ArrowLeft, RefreshCw, Sparkles, Settings } from "lucide-react";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChangeEmailDialog } from "@/components/admin/ChangeEmailDialog";
import { RecoveryEmailDialog } from "@/components/admin/RecoveryEmailDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsuarios: number;
  totalConversas: number;
  totalMensagens: number;
  totalFeedbacks: number;
  conversasPorModo: Record<string, number>;
  conversasPorDia: Record<string, number>;
  feedbacks: any[];
  usuarios: any[];
  mensagensPorConversa: number;
  usuariosAtivos7d: number;
  modoMaisPopular: string;
  taxaRetorno: number;
  usuariosAtivosPorDia: Record<string, number>;
}

type Periodo = "7d" | "30d" | "90d" | "all";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>("30d");
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  const fetchStats = useCallback(async (p: Periodo = periodo) => {
    setLoadingStats(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?periodo=${p}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!response.ok) throw new Error("Erro ao carregar estatísticas");
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      toast({ title: "Erro ao carregar estatísticas", description: err.message, variant: "destructive" });
    } finally {
      setLoadingStats(false);
    }
  }, [periodo]);

  const fetchCampaigns = useCallback(async () => {
    const { data } = await supabase.from("email_campaigns" as any).select("*").order("created_at", { ascending: false });
    setCampaigns((data as any[]) || []);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!adminLoading && !isAdmin && user) {
      navigate("/app");
      return;
    }
    if (isAdmin) {
      fetchStats(periodo);
      fetchCampaigns();
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate, periodo]);

  if (authLoading || adminLoading || loadingStats) {
    return <AdminSkeleton />;
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-gold-dark rounded-xl flex items-center justify-center shadow-elegant">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-medium tracking-tight">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { fetchStats(periodo); fetchCampaigns(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChangeEmailOpen(true)}>
                  Alterar meu email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRecoveryOpen(true)}>
                  Email de recuperação
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Período dos indicadores</h2>
              <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="all">Tudo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <StatsCards
              totalUsuarios={stats.totalUsuarios}
              totalConversas={stats.totalConversas}
              totalMensagens={stats.totalMensagens}
              totalFeedbacks={stats.totalFeedbacks}
            />
            <BehaviorCards
              mensagensPorConversa={stats.mensagensPorConversa}
              usuariosAtivos7d={stats.usuariosAtivos7d}
              modoMaisPopular={stats.modoMaisPopular}
              taxaRetorno={stats.taxaRetorno}
            />
            <UsageCharts
              conversasPorDia={stats.conversasPorDia}
              conversasPorModo={stats.conversasPorModo}
              usuariosAtivosPorDia={stats.usuariosAtivosPorDia}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTable usuarios={stats.usuarios} onRefresh={() => { fetchStats(periodo); }} />
          </TabsContent>

          <TabsContent value="feedbacks">
            <FeedbacksTable feedbacks={stats.feedbacks} />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <CampaignForm onCreated={fetchCampaigns} />
            <CampaignList campaigns={campaigns} onRefresh={fetchCampaigns} />
          </TabsContent>
        </Tabs>
      </div>

      <ChangeEmailDialog
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        currentEmail={user?.email || ""}
      />
      <RecoveryEmailDialog
        open={recoveryOpen}
        onOpenChange={setRecoveryOpen}
      />
    </div>
  );
}
