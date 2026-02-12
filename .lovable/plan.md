

## Gestao de Administradores e Recuperacao de Acesso

Tres funcionalidades serao adicionadas ao painel administrativo:

### 1. Promover/Remover Administradores

Na aba "Usuarios" da tabela existente, cada usuario tera um botao para promover a admin ou remover a role admin. O admin atual nao podera remover a si mesmo se for o unico admin (protecao contra ficar sem acesso).

**Componente novo:** `AdminRoleToggle` -- um botao/badge na tabela de usuarios que mostra a role atual e permite alternar.

**Backend:** Novas actions `grant-admin` e `revoke-admin` na edge function `admin-users`, que inserem/removem registros na tabela `user_roles`. Incluira validacao para impedir que o ultimo admin se remova.

### 2. Alterar Email do Administrador

Na aba "Usuarios" ou em uma secao de configuracoes, o admin podera alterar seu proprio email. Isso usara `supabase.auth.admin.updateUserById()` na edge function.

**Backend:** Nova action `update-email` na edge function `admin-users`.

**Frontend:** Dialogo simples com campo de novo email, acessivel via botao na area do perfil admin ou na tabela.

### 3. Recuperacao de Acesso

Um mecanismo de seguranca para o caso de perder acesso admin:

- **Via email de recuperacao:** O admin podera solicitar um email de redefinicao de senha (ja existe no sistema via pagina de perfil).
- **Email de recuperacao de admin:** Uma nova funcionalidade que permite ao admin cadastrar um "email de recuperacao" salvo na tabela `admin_recovery`. Caso perca acesso, podera usar esse email para solicitar restauracao da role admin via uma edge function dedicada.

---

### Detalhes tecnicos

**Migracao SQL:**
- Criar tabela `admin_recovery` com campos `id`, `user_id` (FK para auth.users), `recovery_email`, `created_at`, com RLS habilitado.

**Edge function `admin-users` -- novas actions:**

```text
grant-admin:   INSERT INTO user_roles (user_id, role) VALUES (targetId, 'admin')
revoke-admin:  DELETE FROM user_roles WHERE user_id = targetId AND role = 'admin'
               (bloquear se count de admins = 1)
update-email:  supabase.auth.admin.updateUserById(userId, { email: newEmail })
set-recovery:  INSERT/UPDATE admin_recovery com email de recuperacao
```

**Novos componentes frontend:**

- `src/components/admin/AdminRoleToggle.tsx` -- badge clicavel na tabela de usuarios
- `src/components/admin/ChangeEmailDialog.tsx` -- dialogo para alterar email
- `src/components/admin/RecoveryEmailDialog.tsx` -- dialogo para cadastrar email de recuperacao

**Alteracoes em arquivos existentes:**

- `src/components/admin/UsersTable.tsx` -- adicionar coluna "Role" com badge admin/user e botao de toggle
- `src/pages/AdminDashboard.tsx` -- adicionar botao de configuracoes no header (alterar email e email de recuperacao)
- `supabase/functions/admin-users/index.ts` -- adicionar as 4 novas actions
- `supabase/functions/admin-stats/index.ts` -- incluir role de cada usuario nos dados retornados

