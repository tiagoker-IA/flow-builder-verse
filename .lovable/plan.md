

## Simplificar Grupos Pequenos: Chat-based com formatacao rica

A ideia central e remover o dashboard complexo e tratar o modo "Grupo Pequeno" exatamente como os demais modos: uma conversa com a IA na interface de chat, com historico na barra lateral esquerda.

---

### Mudanca 1: Remover GruposDashboard do AppDashboard

**Arquivo:** `src/pages/AppDashboard.tsx`

Remover a condicional que renderiza `<GruposDashboard />` quando `modo === "grupo_pequeno"`. O modo Grupo Pequeno passara a usar o mesmo fluxo de chat das outras modalidades (ChatMessages + ChatInput).

---

### Mudanca 2: Reescrever o system prompt do modo `grupo_pequeno`

**Arquivo:** `supabase/functions/chat/index.ts`

O prompt sera atualizado para:

- **Formatacao rica obrigatoria:** instrucoes explicitas para usar espacamento entre paragrafos, bullets, **negrito** nos titulos de secao e *italico* nas citacoes biblicas literais
- **Exaltacao simplificada:** em vez de sugerir nomes de musicas, trazer um versiculo conectado ao tema do dia + dicas para o lider escolher canticos adequados. Oferecer ajuda caso o usuario queira sugestoes especificas
- **Fluxo guiado:** a IA conduz o planejamento da reuniao etapa por etapa (Encontro -> Exaltacao -> Edificacao -> Envio), perguntando ao usuario antes de avancar
- **Tom pratico e acolhedor:** linguagem acessivel para lideres de celula

---

### Mudanca 3: Melhorar regras globais de formatacao

**Arquivo:** `supabase/functions/chat/index.ts`

Atualizar o bloco `INTERACTION_RULES` para incluir instrucoes de formatacao mais claras que se apliquem a todos os modos:

- Usar espacamento entre paragrafos (linha em branco)
- Usar bullets para listas
- **Negrito** em titulos e destaques
- *Italico* em citacoes biblicas literais
- Estrutura visual limpa e organizada

---

### Mudanca 4: Atualizar sugestoes iniciais

**Arquivo:** `src/components/chat/ChatMessages.tsx`

Ajustar as sugestoes do modo `grupo_pequeno` para refletir o novo fluxo conversacional:

- "Planejar reuniao sobre [tema]"
- "Preciso de um quebra-gelo criativo"
- "Me ajude com o estudo de [passagem]"

---

### Resumo tecnico

| Arquivo | Acao |
|---|---|
| `src/pages/AppDashboard.tsx` | Remover condicional do GruposDashboard, remover import |
| `supabase/functions/chat/index.ts` | Reescrever prompt grupo_pequeno + melhorar INTERACTION_RULES |
| `src/components/chat/ChatMessages.tsx` | Ajustar sugestoes iniciais do modo grupo_pequeno |

Os componentes em `src/components/grupos/` e os hooks (`useGrupos`, `useReunioes`, `useMembros`) permanecem no projeto para uso futuro, mas nao serao referenciados no fluxo principal por enquanto.

