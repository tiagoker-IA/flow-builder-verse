

## Corrigir espaçamento entre parágrafos nas respostas da IA

O problema principal é que as classes do Tailwind Typography (`prose-p:my-6`) estão sendo sobrescritas pelo `prose-sm`, e a IA muitas vezes não insere quebras de parágrafo duplas no markdown. Isso faz com que o ReactMarkdown trate tudo como um único bloco de texto.

### Mudança 1: Pós-processar o markdown antes de renderizar

**Arquivo:** `src/components/chat/ChatMessages.tsx`

Criar uma função que processa o texto markdown antes de passar ao ReactMarkdown, garantindo que:
- Linhas que terminam sem pontuação de lista e começam com letra maiúscula sejam separadas por linha em branco
- Blocos como "Sugestão:", "Exemplos:", "Incentive" etc. fiquem em parágrafos distintos

### Mudança 2: Adicionar CSS customizado para forçar espaçamento

**Arquivo:** `src/index.css`

Adicionar regras CSS específicas para o container de mensagens da IA que sobreponham o `prose-sm`:

- Parágrafos (`p`) com margem superior e inferior de pelo menos `1em`
- Títulos (`h1, h2, h3`) com margem superior generosa (`1.5em`) e borda ou espaço extra
- Listas (`ul, ol`) com margem superior de `1em`

Isso garante que, independentemente do Tailwind, o espaçamento visual seja consistente.

### Mudança 3: Reforçar instrução no prompt do sistema

**Arquivo:** `supabase/functions/chat/index.ts`

Tornar a instrução de formatação mais explícita e enfática:
- Adicionar exemplo concreto de como o texto deve ser formatado (com linhas em branco visíveis)
- Instruir a IA a usar `\n\n` (duas quebras de linha) entre cada bloco de conteúdo

---

### Detalhes técnicos

**ChatMessages.tsx:** Criar função `preprocessMarkdown(text: string): string` que insere `\n\n` antes de frases que começam com letra maiúscula após ponto final, garantindo que o ReactMarkdown interprete cada frase longa como parágrafo separado.

**index.css:** Adicionar bloco:
```css
.prose.prose-sm p {
  margin-top: 1em;
  margin-bottom: 1em;
}
.prose.prose-sm h2, .prose.prose-sm h3 {
  margin-top: 1.8em;
}
```

**chat/index.ts:** Adicionar na seção de formatação obrigatória:
```
- CRÍTICO: Sempre use DUAS quebras de linha (linha em branco) entre parágrafos. Exemplo:
  Primeiro parágrafo aqui.

  Segundo parágrafo aqui.
- Nunca escreva dois parágrafos na mesma linha separados apenas por espaço.
```
