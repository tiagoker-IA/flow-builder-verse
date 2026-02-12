

## Melhorar formatacao visual das respostas da IA

O problema atual e que os paragrafos ficam muito proximos uns dos outros e os titulos nao se destacam o suficiente. A solucao envolve dois ajustes:

### Mudanca 1: Ajustar estilos CSS do markdown (ChatMessages.tsx)

Aumentar o espacamento entre paragrafos, listas e titulos no componente que renderiza as respostas da IA. Atualmente os valores de `prose-p:my-5` e similares nao estao gerando separacao visual suficiente.

- Aumentar margens dos paragrafos (`prose-p:my-6`)
- Aumentar margens antes/depois de listas
- Garantir que titulos tenham espacamento superior generoso
- Adicionar `prose-headings:uppercase` e `prose-headings:tracking-wider` para titulos em caixa alta
- Adicionar `prose-li:leading-relaxed` para melhor leitura em bullets

### Mudanca 2: Reforcar instrucoes de formatacao no prompt do sistema (chat/index.ts)

Atualizar as `INTERACTION_RULES` na edge function para instruir a IA a:

- Usar titulos em CAIXA ALTA (ex: "TEXTO", "EXEGESE", nao "Texto")
- Separar cada bloco de conteudo com linha em branco
- Preferir bullets sempre que listar ideias ou pontos
- Manter paragrafos curtos (2-3 frases no maximo)

### Detalhes tecnicos

**ChatMessages.tsx (linha 300):** Atualizar as classes do `div` que envolve o `ReactMarkdown` para aumentar espacamentos e aplicar caixa alta nos titulos.

**chat/index.ts (INTERACTION_RULES):** Adicionar regras explicitas sobre caixa alta em titulos e paragrafos curtos com espacamento.

