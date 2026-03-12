

## Modo Visitante (Guest Mode) — Experimentar sem Cadastro

### Resumo

Permitir que visitantes acessem o chat da plataforma sem criar conta. As conversas serão salvas no `localStorage` do navegador, com limite de **3 conversas** e **20 mensagens por conversa**. Um banner incentivará o cadastro para desbloquear histórico ilimitado.

### Arquitetura

```text
Visitante (sem login)
  ├── Landing Page → botão "Experimentar Grátis"
  ├── /app (sem redirecionamento para /auth)
  ├── useGuestConversas (localStorage)  ← novo hook
  ├── useGuestChat (chama edge function com anon key) ← novo hook
  └── Banner de incentivo ao cadastro

Usuário autenticado (sem mudanças)
  ├── useConversas (Supabase)
  ├── useChat (JWT auth)
  └── Funcionalidade completa
```

### Alterações

#### 1. Edge Function `chat` — Permitir acesso anônimo
- Atualmente exige JWT. Será modificada para aceitar **também** o anon key como Bearer token
- Quando receber anon key (sem user autenticado), permitir a requisição mas com limite de **20 mensagens** no array de histórico
- Log diferenciado: `"guest request"` vs `"authenticated user"`

#### 2. Novo hook: `src/hooks/useGuestConversas.ts`
- Gerencia conversas e mensagens no `localStorage`
- Limite de 3 conversas; ao tentar criar a 4ª, exibe toast sugerindo cadastro
- Mesma interface de retorno que `useConversas` (para o AppDashboard usar de forma intercambiável)
- Chave no storage: `logosflow_guest_conversas`

#### 3. Novo hook: `src/hooks/useGuestChat.ts`
- Envia mensagens para a edge function usando o **anon key** (disponível via `VITE_SUPABASE_PUBLISHABLE_KEY`)
- Mesma lógica de streaming do `useChat`, mas sem salvar no banco — apenas atualiza o state local
- Após a resposta completa, persiste no `localStorage`

#### 4. `src/pages/AppDashboard.tsx` — Suporte a guest mode
- Remover o redirect obrigatório para `/auth` quando `!user`
- Detectar se é visitante (`!user` após auth carregado)
- Se visitante: usar `useGuestConversas` + `useGuestChat`
- Se autenticado: manter `useConversas` + `useChat` (sem mudanças)
- Exibir banner no topo: "Você está no modo visitante. Cadastre-se para salvar seu histórico." com botão "Criar Conta"

#### 5. `src/components/chat/ChatHeader.tsx` — Ajustar para visitante
- Quando `isGuest`: ocultar botões de perfil, dashboard e admin
- Substituir botão "Sair" por botão "Criar Conta" / "Entrar"

#### 6. `src/components/chat/Sidebar.tsx` — Ajustar para visitante
- Quando `isGuest`: ocultar link admin e mostrar aviso de limite de conversas
- Mostrar contador: "1/3 conversas"

#### 7. Landing Page — Botão de acesso direto
- `HeroSection.tsx`: Mudar texto do CTA principal ou adicionar link "Experimentar sem cadastro" abaixo dos botões
- `Header.tsx`: Adicionar link "Experimentar" que vai direto para `/app`

#### 8. Novo componente: `src/components/chat/GuestBanner.tsx`
- Banner fixo no topo do chat para visitantes
- Texto: "Modo visitante — histórico limitado a 3 conversas. Crie sua conta para acesso completo."
- Botão "Criar Conta" que redireciona para `/auth`

### Detalhes Técnicos

- **Segurança**: A edge function já valida input e tem proteção anti-prompt-injection. Para guests, o anon key é público por design — o único risco é abuso de volume, mitigado pelo limite de mensagens no payload e rate limiting existente no gateway
- **Nenhuma migração de banco** necessária
- **Nenhuma dependência nova** necessária
- **localStorage**: Os dados do visitante sobrevivem ao fechar o navegador, mas são perdidos ao limpar cache — comportamento esperado e comunicado ao usuário

