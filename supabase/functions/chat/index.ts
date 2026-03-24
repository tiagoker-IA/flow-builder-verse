import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lida com a requisição de segurança inicial do navegador (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Tenta ler o que o usuário enviou no chat
    const { prompt } = await req.json();

    // Mensagem de segurança para confirmar que o servidor voltou
    const mensagemSegura = "O sistema foi restaurado com sucesso! O erro da tela branca foi corrigido.";

    return new Response(JSON.stringify({ response: mensagemSegura }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Se der qualquer erro, não quebra a tela, apenas avisa o sistema
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
