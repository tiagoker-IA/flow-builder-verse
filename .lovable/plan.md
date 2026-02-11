

## Correcao: Emails de recuperacao de senha nao chegam

### Problema
O backend processa a solicitacao com sucesso (status 200), mas o email nao e entregue. Isso acontece porque o servico de email integrado tem limitacoes de entrega. Sem um provedor de email dedicado configurado, os emails podem simplesmente nao chegar.

### Solucao
Configurar o Resend como provedor de email para garantir a entrega confiavel de todos os emails de autenticacao (recuperacao de senha, confirmacao de conta, etc).

### Passos

**1. Criar conta no Resend (acao do usuario)**
- Acessar [resend.com](https://resend.com) e criar uma conta gratuita
- O plano gratuito permite ate 100 emails/dia, suficiente para a maioria dos casos
- Gerar uma API Key no painel do Resend

**2. Configurar dominio no Resend (opcional mas recomendado)**
- Para melhor entrega, verificar um dominio proprio no Resend
- Sem dominio verificado, os emails serao enviados de `onboarding@resend.dev` (funciona para testes)

**3. Configurar o secret RESEND_API_KEY no projeto**
- Adicionar a API Key do Resend como secret no projeto
- Isso tambem habilitara o envio de campanhas de email que ja esta preparado no sistema

**4. Criar edge function para envio de emails de autenticacao**
- Criar `supabase/functions/send-auth-email/index.ts` que recebe os dados do email de autenticacao e envia via Resend
- Configurar o hook de autenticacao no `supabase/config.toml` para usar esta funcao em vez do servico padrao

**5. Atualizar config.toml**
- Adicionar configuracao do auth hook para redirecionar emails de autenticacao para a edge function customizada

### Detalhes tecnicos

**Edge function `send-auth-email/index.ts`:**
- Recebe payload com tipo de email (recovery, signup, etc), email do destinatario e token
- Gera HTML do email baseado no tipo
- Envia via API do Resend
- Retorna resposta para o sistema de autenticacao

**Configuracao no `config.toml`:**
```text
[auth.hook.send_email]
enabled = true
uri = "pg-functions://supabase/functions/v1/send-auth-email"
```

**Resumo de arquivos:**
- **Novo (1):** `supabase/functions/send-auth-email/index.ts`
- **Modificado (1):** `supabase/config.toml`
- **Secret necessario (1):** `RESEND_API_KEY`

### Importante
Antes de implementar, voce precisara criar uma conta no Resend e fornecer a API Key. O plano gratuito e suficiente para comecar.
