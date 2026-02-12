import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...payload } = await req.json();

    // ===== CREATE USER =====
    if (action === "create") {
      const { email, password } = payload;
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email e senha são obrigatórios" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, user: data.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== BULK CREATE =====
    if (action === "bulk-create") {
      const { users } = payload as { users: { email: string; password: string }[] };
      if (!users || !Array.isArray(users) || users.length === 0) {
        return new Response(JSON.stringify({ error: "Lista de usuários vazia" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const results: { email: string; success: boolean; error?: string }[] = [];
      for (const u of users) {
        const { error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
        });
        results.push({
          email: u.email,
          success: !error,
          ...(error ? { error: error.message } : {}),
        });
      }
      const successCount = results.filter((r) => r.success).length;
      return new Response(
        JSON.stringify({ success: true, total: users.length, created: successCount, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== DELETE USER =====
    if (action === "delete") {
      const { userId } = payload;
      if (!userId) {
        return new Response(JSON.stringify({ error: "userId é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== GRANT ADMIN =====
    if (action === "grant-admin") {
      const { targetUserId } = payload;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "targetUserId é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Check if already admin
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", targetUserId)
        .eq("role", "admin")
        .maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ error: "Usuário já é admin" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUserId, role: "admin" });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== REVOKE ADMIN =====
    if (action === "revoke-admin") {
      const { targetUserId } = payload;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "targetUserId é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Count total admins
      const { count } = await supabase
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        return new Response(JSON.stringify({ error: "Não é possível remover o último administrador" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", "admin");
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== UPDATE EMAIL =====
    if (action === "update-email") {
      const { newEmail } = payload;
      if (!newEmail) {
        return new Response(JSON.stringify({ error: "Novo email é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.auth.admin.updateUserById(user.id, { email: newEmail });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== SET RECOVERY EMAIL =====
    if (action === "set-recovery") {
      const { recoveryEmail } = payload;
      if (!recoveryEmail) {
        return new Response(JSON.stringify({ error: "Email de recuperação é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Upsert recovery email
      const { data: existing } = await supabase
        .from("admin_recovery")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("admin_recovery")
          .update({ recovery_email: recoveryEmail })
          .eq("user_id", user.id);
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        const { error } = await supabase
          .from("admin_recovery")
          .insert({ user_id: user.id, recovery_email: recoveryEmail });
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== GET RECOVERY EMAIL =====
    if (action === "get-recovery") {
      const { data } = await supabase
        .from("admin_recovery")
        .select("recovery_email")
        .eq("user_id", user.id)
        .maybeSingle();
      return new Response(JSON.stringify({ recoveryEmail: data?.recovery_email || null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Admin users error:", err);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
