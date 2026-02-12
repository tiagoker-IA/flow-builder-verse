

## Tornar o primeiro usuario admin automaticamente

Como voce e o unico usuario cadastrado e a tabela `user_roles` esta vazia, a solucao mais simples e segura e criar um **trigger no banco de dados** que atribui a role `admin` automaticamente ao primeiro usuario que se cadastrar. Para usuarios subsequentes, a role padrao sera `user`.

Alem disso, como ja existe um usuario cadastrado (tiagoker@gmail.com) sem role, o trigger nao se aplica retroativamente. Entao a migracao tambem incluira um **INSERT direto** para conceder admin ao usuario atual.

---

### Mudanca 1: Migracao SQL

Criar uma migracao que:

1. **Insere a role admin para o usuario atual** (tiagoker@gmail.com), resolvendo o problema imediato
2. **Cria uma funcao + trigger** que, ao inserir um novo usuario em `auth.users`, verifica se a tabela `user_roles` esta vazia. Se estiver, atribui `admin`; caso contrario, atribui `user`

```sql
-- Conceder admin ao usuario existente
INSERT INTO public.user_roles (user_id, role)
VALUES ('cdf1cf04-0610-409b-83fe-4e008f1c491d', 'admin');

-- Funcao para auto-atribuir role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger na criacao de usuario
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
```

---

### Mudanca 2: Adicionar link visivel para o painel admin

**Arquivo:** `src/pages/AppDashboard.tsx`

Alem do icone no header do chat, adicionar um link/botao mais visivel no layout principal (por exemplo, na sidebar ou como um banner discreto) para que admins encontrem facilmente o painel administrativo.

---

### Resumo

| Acao | Detalhe |
|---|---|
| Migracao SQL | Inserir role admin para usuario atual + trigger para novos usuarios |
| AppDashboard | Tornar acesso ao admin mais visivel na interface |

Apos a migracao, basta recarregar a pagina `/app` e o icone de escudo aparecera no header do chat, levando ao painel administrativo em `/admin`.
