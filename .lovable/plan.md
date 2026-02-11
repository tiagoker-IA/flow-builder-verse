

## Adicionar Pagina de Perfil do Usuario

O projeto ja tem autenticacao completa (login, cadastro, recuperacao de senha, protecao de rotas, RLS). O que falta e uma pagina de perfil do usuario.

### O que sera feito

#### 1. Criar tabela `profiles` no banco de dados

Uma nova tabela para armazenar dados adicionais do usuario:
- `id` (uuid, referencia auth.users)
- `nome` (text, nome de exibicao)
- `avatar_url` (text, URL da foto de perfil)
- `created_at`, `updated_at`

Com RLS para que cada usuario so acesse seu proprio perfil.

Um trigger automatico para criar o perfil quando um novo usuario se cadastra.

#### 2. Criar bucket de storage `avatars`

Bucket publico para armazenar fotos de perfil, com politicas RLS para upload/delete apenas pelo proprio usuario.

#### 3. Criar pagina `/profile`

Uma pagina com:
- Exibicao do email (somente leitura, vem do auth)
- Campo editavel para nome de exibicao
- Upload de foto de perfil com preview
- Botao para alterar senha (envia email de reset)
- Botao para voltar ao app

#### 4. Adicionar rota e navegacao

- Nova rota `/profile` no `App.tsx` (com lazy loading)
- Botao de perfil no `ChatHeader.tsx` (icone de usuario ao lado do logout)

### Detalhes tecnicos

**Migracao SQL:**
```text
- Tabela profiles (id, nome, avatar_url, created_at, updated_at)
- FK para auth.users com ON DELETE CASCADE
- RLS: SELECT, UPDATE, INSERT apenas para o proprio usuario
- Trigger: cria perfil automaticamente no signup
- Bucket avatars com politicas de acesso
```

**Arquivos novos:**
- `src/pages/Profile.tsx` - Pagina de perfil
- `src/hooks/useProfile.ts` - Hook para carregar/atualizar perfil

**Arquivos modificados:**
- `src/App.tsx` - Adicionar rota /profile com lazy loading
- `src/components/chat/ChatHeader.tsx` - Adicionar botao de perfil

