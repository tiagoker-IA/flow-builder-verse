import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseAuth.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse periodo query param
    const url = new URL(req.url);
    const periodo = url.searchParams.get("periodo") || "30d";

    const now = new Date();
    let dataInicio: Date | null = null;
    if (periodo === "7d") dataInicio = new Date(now.getTime() - 7 * 86400000);
    else if (periodo === "30d") dataInicio = new Date(now.getTime() - 30 * 86400000);
    else if (periodo === "90d") dataInicio = new Date(now.getTime() - 90 * 86400000);
    // "all" => null

    // Fetch all data in parallel
    const [
      usersRes,
      conversasCountRes,
      mensagensCountRes,
      feedbacksRes,
      allConversasRes,
      allMensagensRes,
    ] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      supabaseAdmin.from("conversas").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("mensagens").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("feedbacks").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("conversas").select("id, usuario_criador, modo, data_criacao, updated_at").order("data_criacao", { ascending: true }),
      supabaseAdmin.from("mensagens").select("conversa_pai"),
    ]);

    const users = usersRes.data?.users || [];
    const allConversas = allConversasRes.data || [];
    const allMensagens = allMensagensRes.data || [];

    // Admin roles
    const { data: adminRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");
    const adminUserIds = new Set((adminRoles || []).map((r: any) => r.user_id));

    // --- Totals (always unfiltered) ---
    const totalUsuarios = users.length;
    const totalConversas = conversasCountRes.count || 0;
    const totalMensagens = mensagensCountRes.count || 0;
    const totalFeedbacks = (feedbacksRes.data || []).length;

    // --- Filter conversas by periodo ---
    const conversasFiltradas = dataInicio
      ? allConversas.filter((c: any) => new Date(c.data_criacao) >= dataInicio!)
      : allConversas;

    // Conversas por modo (filtered)
    const modoCount: Record<string, number> = {};
    conversasFiltradas.forEach((c: any) => {
      modoCount[c.modo] = (modoCount[c.modo] || 0) + 1;
    });

    // Conversas por dia (filtered, last 30 within periodo)
    const conversasPorDia: Record<string, number> = {};
    conversasFiltradas.forEach((c: any) => {
      const day = new Date(c.data_criacao).toISOString().split("T")[0];
      conversasPorDia[day] = (conversasPorDia[day] || 0) + 1;
    });

    // --- Behavioral metrics ---

    // Mensagens por conversa (filtered)
    const conversaIdsFiltradas = new Set(conversasFiltradas.map((c: any) => c.id));
    const mensagensFiltradas = allMensagens.filter((m: any) => conversaIdsFiltradas.has(m.conversa_pai));
    const mensagensPorConversa = conversasFiltradas.length > 0
      ? Math.round((mensagensFiltradas.length / conversasFiltradas.length) * 10) / 10
      : 0;

    // Usuarios ativos 7d (always last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const usuariosAtivos7d = new Set(
      allConversas
        .filter((c: any) => new Date(c.data_criacao) >= sevenDaysAgo)
        .map((c: any) => c.usuario_criador)
    ).size;

    // Modo mais popular (filtered)
    let modoMaisPopular = "-";
    if (Object.keys(modoCount).length > 0) {
      modoMaisPopular = Object.entries(modoCount).sort((a, b) => b[1] - a[1])[0][0];
    }

    // Taxa de retorno (filtered) - % of users with >1 conversation
    const conversasPorUsuario: Record<string, number> = {};
    conversasFiltradas.forEach((c: any) => {
      conversasPorUsuario[c.usuario_criador] = (conversasPorUsuario[c.usuario_criador] || 0) + 1;
    });
    const usersComConversa = Object.keys(conversasPorUsuario).length;
    const usersComRetorno = Object.values(conversasPorUsuario).filter(n => n > 1).length;
    const taxaRetorno = usersComConversa > 0 ? Math.round((usersComRetorno / usersComConversa) * 100) : 0;

    // Usuarios ativos por dia (filtered)
    const usuariosAtivosPorDia: Record<string, Set<string>> = {};
    conversasFiltradas.forEach((c: any) => {
      const day = new Date(c.data_criacao).toISOString().split("T")[0];
      if (!usuariosAtivosPorDia[day]) usuariosAtivosPorDia[day] = new Set();
      usuariosAtivosPorDia[day].add(c.usuario_criador);
    });
    const usuariosAtivosPorDiaCount: Record<string, number> = {};
    Object.entries(usuariosAtivosPorDia).forEach(([day, set]) => {
      usuariosAtivosPorDiaCount[day] = set.size;
    });

    // --- Stats por usuario ---
    // Message counts per conversa
    const msgCountPerConversa: Record<string, number> = {};
    allMensagens.forEach((m: any) => {
      msgCountPerConversa[m.conversa_pai] = (msgCountPerConversa[m.conversa_pai] || 0) + 1;
    });

    const statsPorUsuario: Record<string, { conversas: number; mensagens: number; ultimoUso: string | null; modoFavorito: string }> = {};
    allConversas.forEach((c: any) => {
      const uid = c.usuario_criador;
      if (!statsPorUsuario[uid]) {
        statsPorUsuario[uid] = { conversas: 0, mensagens: 0, ultimoUso: null, modoFavorito: "" };
      }
      const s = statsPorUsuario[uid];
      s.conversas++;
      s.mensagens += msgCountPerConversa[c.id] || 0;
      if (!s.ultimoUso || c.updated_at > s.ultimoUso) s.ultimoUso = c.updated_at;
    });

    // Calculate modoFavorito per user
    const modoPorUsuario: Record<string, Record<string, number>> = {};
    allConversas.forEach((c: any) => {
      const uid = c.usuario_criador;
      if (!modoPorUsuario[uid]) modoPorUsuario[uid] = {};
      modoPorUsuario[uid][c.modo] = (modoPorUsuario[uid][c.modo] || 0) + 1;
    });
    Object.entries(modoPorUsuario).forEach(([uid, modos]) => {
      if (statsPorUsuario[uid]) {
        statsPorUsuario[uid].modoFavorito = Object.entries(modos).sort((a, b) => b[1] - a[1])[0][0];
      }
    });

    // Users list
    const usersList = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      is_admin: adminUserIds.has(u.id),
      ...(statsPorUsuario[u.id] || { conversas: 0, mensagens: 0, ultimoUso: null, modoFavorito: "-" }),
    }));

    const result = {
      totalUsuarios,
      totalConversas,
      totalMensagens,
      totalFeedbacks,
      conversasPorModo: modoCount,
      conversasPorDia,
      feedbacks: feedbacksRes.data || [],
      usuarios: usersList,
      // Behavioral
      mensagensPorConversa,
      usuariosAtivos7d,
      modoMaisPopular,
      taxaRetorno,
      usuariosAtivosPorDia: usuariosAtivosPorDiaCount,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
