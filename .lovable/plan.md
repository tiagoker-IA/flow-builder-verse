
# Painel Administrativo Completo + Preparacao para Envio de Emails

## Resumo

Construir um painel administrativo completo com metricas, gestao de usuarios, feedbacks, e uma interface de campanhas de email (preparada para funcionar quando o servico de email for configurado).

---

## 1. Banco de Dados (Migracoes)

### Tabela `user_roles`
- Enum `app_role` com valores: `admin`, `user`
- Tabela com `user_id` (referencia `auth.users`) e `role`
- Funcao `has_role()` com SECURITY DEFINER para evitar recursao RLS
- Politica RLS: usuarios so podem ler sua propria role
- Inserir seu usuario como admin (sera necessario informar o email para identificar o ID)

### Tabela `email_campaigns`
- Colunas: `id`, `titulo`, `assunto`, `conteudo_html`, `status` (rascunho/enviando/enviada/erro), `total_destinatarios`, `enviados_count`, `created_by`, `created_at`, `sent_at`
- Politicas RLS: apenas admins podem criar, ler e atualizar campanhas

---

## 2. Edge Functions

### `admin-stats`
- Valida JWT e verifica role admin via `has_role()`
- Usa service role key para consultar dados agregados:
  - Total de usuarios (de `auth.users`)
  - Usuarios por periodo
  - Total de conversas e distribuicao por modo
  - Total de mensagens
  - Feedbacks com detalhes
  - Lista de emails para exportacao CSV

### `send-campaign`
- Valida JWT e verifica role admin
- Recebe ID da campanha
- Busca emails dos usuarios via service role
- Envia via Resend (quando configurado)
- Atualiza status da campanha
- Por enquanto: retornara mensagem informando que o servico de email ainda nao foi configurado

---

## 3. Frontend - Novos Arquivos

### Pagina principal: `src/pages/AdminDashboard.tsx`
- Rota protegida `/admin` - redireciona se nao for admin
- Layout com Tabs: Visao Geral | Usuarios | Feedbacks | Campanhas
- Responsivo para mobile

### Hook: `src/hooks/useAdmin.ts`
- Verifica se usuario logado tem role `admin` na tabela `user_roles`
- Retorna `{ isAdmin, loading }`

### Componentes admin:
- `src/components/admin/StatsCards.tsx` - Cards com metricas principais (total usuarios, conversas, mensagens, feedbacks)
- `src/components/admin/UsageCharts.tsx` - Graficos com Recharts: conversas por dia, distribuicao por modo (pizza)
- `src/components/admin/UsersTable.tsx` - Tabela de usuarios com email, data de cadastro, quantidade de conversas, botao exportar CSV
- `src/components/admin/FeedbacksTable.tsx` - Tabela de feedbacks com filtros por tipo e nota
- `src/components/admin/CampaignForm.tsx` - Formulario para criar campanha (titulo, assunto, conteudo HTML)
- `src/components/admin/CampaignList.tsx` - Lista de campanhas com status e botao enviar

---

## 4. Alteracoes em Arquivos Existentes

### `src/App.tsx`
- Adicionar rota `/admin` apontando para `AdminDashboard`

### `src/components/chat/ChatHeader.tsx`
- Adicionar link/botao "Admin" visivel apenas para admins (usando `useAdmin` hook)

---

## 5. Fluxo de Acesso

```text
Usuario logado
  -> useAdmin() consulta user_roles
  -> Se admin: botao "Admin" aparece no header do chat
  -> Clica em Admin: navega para /admin
  -> /admin mostra dashboard com 4 abas

Campanha de email:
  -> Admin cria campanha (salva como rascunho)
  -> Clica "Enviar" -> confirmacao com total de destinatarios
  -> Edge function tenta enviar
  -> Sem Resend configurado: mostra aviso de que precisa configurar
```

## Detalhes Tecnicos

- Graficos usam Recharts (ja instalado)
- Tabelas usam componentes Table existentes
- Tabs usam componentes Tabs existentes
- Cards usam componentes Card existentes
- Exportacao CSV feita no frontend com `file-saver` (ja instalado)
- Edge functions usam SUPABASE_SERVICE_ROLE_KEY para acessar `auth.users`
- Todas as consultas admin sao feitas via edge function (nunca diretamente do cliente) para seguranca

## Proximo passo apos implementacao

Quando quiser ativar o envio de emails, bastara:
1. Criar conta no Resend e verificar dominio
2. Fornecer a API key para armazenamento seguro
3. A infraestrutura ja estara pronta para funcionar
