
## Indicadores Avancados de Uso e Comportamento

A ideia e manter a visao geral simples (cards + graficos atuais) e adicionar indicadores de comportamento mais ricos, com possibilidade de expandir detalhes sob demanda.

### O que sera adicionado

**1. Cards com indicadores extras (Visao Geral)**

Alem dos 4 cards atuais (Usuarios, Conversas, Mensagens, Feedbacks), adicionar uma segunda fileira com metricas comportamentais:

- **Media de mensagens por conversa** -- indica profundidade de engajamento
- **Usuarios ativos (ultimos 7 dias)** -- quantos usuarios usaram a plataforma recentemente
- **Modo mais popular** -- qual modo de chat e mais utilizado
- **Taxa de retorno** -- % de usuarios com mais de 1 conversa (indica retencao)

Esses cards terao visual mais discreto (menores, cor secundaria) para diferenciar dos totais principais.

**2. Grafico de linha: Usuarios ativos por dia**

Um novo grafico de linha (LineChart) mostrando quantos usuarios distintos criaram conversas por dia nos ultimos 30 dias. Complementa o grafico de barras existente (conversas/dia) ao revelar se o volume vem de muitos usuarios ou poucos usuarios repetidos.

**3. Tabela de detalhamento por usuario (expandivel)**

Na aba "Usuarios", ao lado de cada usuario, mostrar colunas extras:
- **Conversas** -- total de conversas do usuario
- **Mensagens** -- total de mensagens
- **Ultimo uso** -- data da ultima conversa
- **Modo favorito** -- modo mais usado pelo usuario

Isso permite identificar rapidamente quem sao os usuarios mais engajados e quais modos cada um prefere.

**4. Filtro de periodo na Visao Geral**

Adicionar um seletor de periodo (7 dias, 30 dias, 90 dias, Tudo) na aba Visao Geral para que os graficos e metricas comportamentais respondam ao periodo selecionado.

---

### Detalhes tecnicos

**Edge function `admin-stats/index.ts`:**

Adicionar ao response:
- `mensagensPorConversa`: media (totalMensagens / totalConversas)
- `usuariosAtivos7d`: count distinct de `usuario_criador` em conversas dos ultimos 7 dias
- `modoMaisPopular`: modo com maior contagem
- `taxaRetorno`: % de usuarios com mais de 1 conversa
- `usuariosAtivosPorDia`: agrupamento de usuarios distintos por dia (ultimos 30 dias)
- `statsPorUsuario`: para cada usuario, total de conversas, mensagens, ultimo uso e modo favorito

Aceitar query param `periodo` (7d, 30d, 90d, all) para filtrar os dados temporais.

**Novos/alterados componentes frontend:**

- `src/components/admin/BehaviorCards.tsx` (novo) -- segunda fileira de cards com metricas comportamentais
- `src/components/admin/UsageCharts.tsx` (alterado) -- adicionar grafico de linha de usuarios ativos/dia
- `src/components/admin/StatsCards.tsx` -- sem alteracao (mantem os totais simples)
- `src/components/admin/UsersTable.tsx` (alterado) -- adicionar colunas de conversas, mensagens, ultimo uso e modo favorito
- `src/pages/AdminDashboard.tsx` (alterado) -- adicionar seletor de periodo e o novo componente BehaviorCards

**Fluxo de dados:**

```text
AdminDashboard
  |-- [periodo state: 7d | 30d | 90d | all]
  |-- fetchStats(periodo) --> admin-stats edge function
  |
  |-- Visao Geral tab
  |     |-- StatsCards (totais simples)
  |     |-- BehaviorCards (metricas comportamentais)
  |     |-- UsageCharts (barras + pizza + linha usuarios ativos)
  |
  |-- Usuarios tab
        |-- UsersTable (com colunas extras por usuario)
```
