

## Plano: Correcao de Seguranca e Melhorias

### 1. Correcao de Seguranca no Chat (Prioridade Alta)

**Problema encontrado:** O hook `useChat.ts` envia requisicoes para a funcao de chat usando a chave publica do projeto em vez do token JWT do usuario autenticado. Isso impede que o backend identifique corretamente quem esta fazendo a requisicao.

**Correcao:** Alterar `useChat.ts` para obter o token da sessao do usuario via `supabase.auth.getSession()` e usa-lo no header `Authorization`.

**Arquivo modificado:** `src/hooks/useChat.ts`

### 2. Verificacao de Seguranca Geral

O linter de seguranca do banco de dados nao encontrou problemas - as politicas RLS estao configuradas corretamente. Nenhuma acao adicional necessaria aqui.

### 3. Notificacoes em Tempo Real no Chat

**O que muda:** Quando uma conversa esta aberta, novas mensagens salvas no banco aparecem automaticamente sem precisar recarregar.

**Como funciona:** Usar o canal Realtime do banco de dados para escutar insercoes na tabela `mensagens` filtradas pela conversa atual.

**Arquivos:**
- Migração SQL: Habilitar realtime na tabela `mensagens`
- `src/hooks/useConversas.ts` - Adicionar subscription realtime ao selecionar conversa

### 4. Melhorias no Dashboard Pessoal

**Exportacao CSV:** Botao para exportar dados de conversas e atividade em formato CSV.

**Arquivo novo:** `src/lib/exportToCsv.ts` - Utilitario de exportacao
**Arquivo modificado:** `src/pages/UserDashboard.tsx` - Adicionar botao de exportacao

---

### Detalhes tecnicos

**Correcao de seguranca (useChat.ts):**
```text
Antes:  Authorization: Bearer VITE_SUPABASE_PUBLISHABLE_KEY
Depois: Authorization: Bearer session.access_token
```
O token JWT do usuario permite que a edge function `chat` identifique o usuario via `getClaims()`, garantindo autenticacao real.

**Realtime (useConversas.ts):**
- Criar subscription com `supabase.channel()` filtrada por `conversa_pai`
- Cleanup automatico ao trocar de conversa ou desmontar componente
- Migração SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;`

**Exportacao CSV:**
- Funcao generica que converte array de objetos em string CSV
- Download automatico via `Blob` e link temporario

**Resumo de arquivos:**
- **Modificados (3):** `useChat.ts`, `useConversas.ts`, `UserDashboard.tsx`
- **Novos (1):** `src/lib/exportToCsv.ts`
- **Migracao SQL (1):** Habilitar realtime para mensagens
