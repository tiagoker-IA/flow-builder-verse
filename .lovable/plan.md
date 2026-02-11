

## Próximo passo: Configurar a API Key e implementar

Agora que você tem a API Key do Resend pronta, vamos seguir com a implementação:

### Passo 1 - Adicionar o secret RESEND_API_KEY
- Vou solicitar que você cole a API Key em um formulário seguro
- Ela será armazenada de forma segura e acessível apenas pelas funções backend

### Passo 2 - Criar a função backend de envio de emails
- Criar `supabase/functions/send-auth-email/index.ts`
- Essa função receberá as solicitações de email de autenticação (recuperação de senha, confirmação de conta) e enviará via Resend
- Os emails serão enviados de `onboarding@resend.dev` (remetente padrão do Resend para contas sem domínio verificado)

### Passo 3 - Configurar o redirecionamento de emails
- Atualizar `supabase/config.toml` para que os emails de autenticação passem pela nova função em vez do serviço padrão

### Resumo
- **Secret:** `RESEND_API_KEY` (você cola a chave)
- **Novo arquivo:** `supabase/functions/send-auth-email/index.ts`
- **Arquivo atualizado:** `supabase/config.toml`

Após a implementação, os emails de recuperação de senha e confirmação de conta serão entregues de forma confiável.

