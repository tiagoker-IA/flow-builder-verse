
# Painel Administrativo Completo + Preparacao para Envio de Emails

## Resumo

Construir um painel administrativo completo com metricas, gestao de usuarios, feedbacks, e uma interface de campanhas de email (preparada para funcionar quando o servico de email for configurado).

---

## 1. Banco de Dados (Migracoes) ✅

### Tabela `user_roles`
- Enum `app_role` com valores: `admin`, `user`
- Tabela com `user_id` (referencia `auth.users`) e `role`
- Funcao `has_role()` com SECURITY DEFINER para evitar recursao RLS
- Politica RLS: usuarios so podem ler sua propria role
- tiagoker@gmail.com configurado como admin

### Tabela `email_campaigns`
- Colunas: `id`, `titulo`, `assunto`, `conteudo_html`, `status` (rascunho/enviando/enviada/erro), `total_destinatarios`, `enviados_count`, `created_by`, `created_at`, `sent_at`
- Politicas RLS: apenas admins podem criar, ler e atualizar campanhas

---

## 2. Edge Functions ✅

### `admin-stats` - Retorna metricas agregadas (usuarios, conversas, mensagens, feedbacks)
### `send-campaign` - Envia campanha via Resend (quando configurado)

---

## 3. Frontend ✅

### Pagina: `src/pages/AdminDashboard.tsx` com 4 abas
### Hook: `src/hooks/useAdmin.ts`
### Componentes: StatsCards, UsageCharts, UsersTable, FeedbacksTable, CampaignForm, CampaignList

---

## 4. Integração ✅

### Rota `/admin` no App.tsx
### Botão Admin (Shield) no ChatHeader visível apenas para admins

---

## Proximo passo apos implementacao

Quando quiser ativar o envio de emails, bastara:
1. Criar conta no Resend e verificar dominio
2. Fornecer a API key para armazenamento seguro
3. A infraestrutura ja estara pronta para funcionar
