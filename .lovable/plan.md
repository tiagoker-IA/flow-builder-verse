

# Gestao de Usuarios no Painel Admin

## O que sera implementado

Tres funcionalidades novas na aba "Usuarios" do painel administrativo:

1. **Adicionar usuario** - Formulario para criar um novo usuario com email e senha
2. **Importar usuarios** - Upload de arquivo CSV com lista de emails (e senhas opcionais) para cadastro em lote
3. **Deletar usuario** - Botao de exclusao em cada linha da tabela, com confirmacao

---

## Como vai funcionar

### Adicionar usuario
- Botao "Adicionar" abre um dialog com campos: email e senha
- Ao confirmar, chama a edge function que cria o usuario via API administrativa

### Importar usuarios (CSV)
- Botao "Importar CSV" abre um dialog para upload de arquivo
- O CSV deve ter pelo menos a coluna `email` (coluna `senha` e opcional; se ausente, uma senha aleatoria sera gerada)
- Mostra preview dos emails encontrados antes de confirmar
- Envia a lista para a edge function que cria os usuarios em lote

### Deletar usuario
- Icone de lixeira em cada linha da tabela
- Ao clicar, abre dialogo de confirmacao com o email do usuario
- Confirmar chama a edge function que remove o usuario

---

## Detalhes tecnicos

### Nova Edge Function: `admin-users`
- Rota unica que recebe `action` no body: `create`, `bulk-create` ou `delete`
- Valida JWT e verifica role admin (mesmo padrao do `admin-stats`)
- Usa `supabase.auth.admin` para:
  - `createUser({ email, password })` para criacao individual
  - Loop de `createUser` para importacao em lote
  - `deleteUser(userId)` para exclusao
- Retorna resultado com sucesso/erros por usuario

### Alteracoes no frontend

**`src/components/admin/UsersTable.tsx`**
- Adicionar botoes "Adicionar" e "Importar CSV" no header
- Adicionar coluna "Acoes" com botao deletar em cada linha
- Receber callback `onRefresh` para recarregar dados apos alteracoes

**Novos componentes:**
- `src/components/admin/AddUserDialog.tsx` - Dialog com formulario de email + senha
- `src/components/admin/ImportUsersDialog.tsx` - Dialog com upload CSV, preview e confirmacao
- `src/components/admin/DeleteUserDialog.tsx` - Dialog de confirmacao de exclusao

**`src/pages/AdminDashboard.tsx`**
- Passar callback `onRefresh={fetchStats}` para o `UsersTable`

