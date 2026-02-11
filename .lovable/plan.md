

## Correção: Hook de email não está chamando a Edge Function

### Problema identificado
A configuração `uri = "pg-functions://postgres/public/send-auth-email"` no hook de autenticação espera uma **função PostgreSQL**, mas o que foi criado foi uma **Edge Function**. São coisas diferentes — o hook nunca chama a edge function, por isso:
- Não há logs na edge function
- Nenhum email é enviado
- O sistema retorna status 200 mas ignora silenciosamente o envio

### Solução
Criar uma **função PostgreSQL** intermediária que:
1. Recebe o payload do hook de autenticação
2. Faz uma chamada HTTP para a Edge Function usando `net.http_post`
3. A Edge Function envia o email via Resend

### Passos técnicos

**1. Habilitar a extensão `pg_net`** (para chamadas HTTP a partir do PostgreSQL)

**2. Criar a função PostgreSQL `send-auth-email`** no schema `public` que:
- Recebe os parâmetros do hook (`user_id`, `email`, `token`, etc.)
- Monta o payload JSON
- Chama a Edge Function via `net.http_post`
- Retorna o formato esperado pelo hook de autenticação

**3. Manter a Edge Function existente** (`supabase/functions/send-auth-email/index.ts`) sem alterações — ela já está correta para receber o payload e enviar via Resend.

### Resumo de mudanças
- **Nova migração SQL:** Criar função PostgreSQL `public.send-auth-email` + habilitar `pg_net`
- **Sem alterações** na Edge Function ou no `config.toml`
