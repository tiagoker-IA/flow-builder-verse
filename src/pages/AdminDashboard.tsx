import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/admin/StatsCards";
import { UsageCharts } from "@/components/admin/UsageCharts";
import { UsersTable } from "@/components/admin/UsersTable";
import { FeedbacksTable } from "@/components/admin/FeedbacksTable";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { CampaignList } from "@/components/admin/CampaignList";
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
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
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-stats", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      setStats(res.data);
    } catch (err: any) {
      toast({ title: "Erro ao carregar estatísticas", description: err.message, variant: "destructive" });
    } finally {
      setLoadingStats(false);
    }
  }, []);

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
      fetchStats();
      fetchCampaigns();
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate, fetchStats, fetchCampaigns]);

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
            <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchCampaigns(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
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
            <StatsCards
              totalUsuarios={stats.totalUsuarios}
              totalConversas={stats.totalConversas}
              totalMensagens={stats.totalMensagens}
              totalFeedbacks={stats.totalFeedbacks}
            />
            <UsageCharts
              conversasPorDia={stats.conversasPorDia}
              conversasPorModo={stats.conversasPorModo}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTable usuarios={stats.usuarios} onRefresh={() => { fetchStats(); }} />
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
    </div>
  );
}
