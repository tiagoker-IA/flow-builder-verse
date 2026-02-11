

## Transformacao: Modo Academico -> Grupos Pequenos (4Es)

Este plano cobre a implementacao completa da funcionalidade de Grupos Pequenos, substituindo o modo "academico" no seletor de modos do chat.

---

### Fase 1: Banco de Dados (12 tabelas + RLS)

Criar todas as tabelas necessarias via migracoes SQL:

**Tabelas principais:**
1. `grupos_pequenos` - id, nome, lider_id (uuid), dia_semana, horario, local, created_at
2. `membros_grupo` - id, grupo_id (FK), user_id (uuid), papel (enum: lider/vice_lider/membro), data_entrada, ativo
3. `reunioes` - id, grupo_id (FK), data_reuniao, tema_geral, status (enum: planejada/em_andamento/concluida), created_at

**Tabelas dos 4Es:**
4. `encontro` - id, reuniao_id (FK), titulo, instrucoes, duracao_minutos, relacionado_tema
5. `exaltacao` - id, reuniao_id (FK), duracao_minutos, notas_lider
6. `musicas_exaltacao` - id, exaltacao_id (FK), titulo, artista, link_video, executada
7. `edificacao` - id, reuniao_id (FK), referencia_biblica, texto_completo, contexto_historico, tema_principal
8. `perguntas_edificacao` - id, edificacao_id (FK), ordem, texto_pergunta, tipo (enum: reflexiva/testemunhal/aplicacao/comunitaria)
9. `respostas_perguntas` - id, pergunta_id (FK), membro_id (FK), resposta_texto, tipo_partilha
10. `envio` - id, reuniao_id (FK), desafio_texto, tipo (enum: individual/coletivo/ambos)
11. `compromissos_envio` - id, envio_id (FK), membro_id (FK), comprometeu, cumprido, testemunho_resultado
12. `presencas` - id, reuniao_id (FK), membro_id (FK), presente

**Tabela auxiliar:**
13. `quebragelos_favoritos` - id, user_id, titulo, instrucoes, tags

**RLS:**
- Membros so veem dados do seu grupo (via subquery em membros_grupo)
- Lideres/vice-lideres podem criar/editar reunioes do grupo
- Membros podem inserir respostas e compromissos
- Funcao `is_group_leader(user_id, grupo_id)` e `is_group_member(user_id, grupo_id)` como security definer

---

### Fase 2: Atualizar Tipos e Modo de Chat

**Arquivo `src/types/chat.ts`:**
- Substituir `academico` por `grupo_pequeno` no tipo `ChatMode`
- Atualizar `MODOS_CHAT` com novo icone (Users), label "Grupo Pequeno", descricao "Planeje reunioes com os 4Es"

**Arquivo `supabase/functions/chat/index.ts`:**
- Substituir `academico` por `grupo_pequeno` no VALID_MODES
- Criar system prompt especifico para ajudar a planejar reunioes seguindo a metodologia 4Es

---

### Fase 3: Tipos TypeScript

Criar `src/types/grupos.ts` com todas as interfaces:
- GrupoPequeno, MembroGrupo, Reuniao, Encontro, Exaltacao, MusicaExaltacao, Edificacao, PerguntaEdificacao, RespostaPergunta, Envio, CompromissoEnvio, Presenca

---

### Fase 4: Hooks de Dados

Criar hooks para interacao com o banco:
- `src/hooks/useGrupos.ts` - CRUD de grupos, listar grupos do usuario
- `src/hooks/useReunioes.ts` - CRUD de reunioes, com dados dos 4Es
- `src/hooks/useMembros.ts` - gestao de membros, presenca
- `src/hooks/useEdificacao.ts` - perguntas, respostas, partilhas

---

### Fase 5: Componentes de UI

**Layout principal (`src/components/grupos/`):**

1. `GruposDashboard.tsx` - Pagina principal com lista de grupos, calendario, metricas
2. `GrupoForm.tsx` - Criar/editar grupo (nome, dia, horario, local)
3. `MembrosManager.tsx` - Lista de membros, adicionar/remover, definir papeis
4. `ReuniaoForm.tsx` - Formulario completo de reuniao com abas dos 4Es

**Componentes dos 4Es:**
5. `EncontroSection.tsx` - Campo titulo, instrucoes, duracao, banco de quebra-gelos
6. `ExaltacaoSection.tsx` - Lista de musicas, adicionar, marcar executada, timer, links
7. `EdificacaoSection.tsx` - Seletor de referencia biblica, contexto, perguntas interativas com respostas
8. `EnvioSection.tsx` - Desafio, tipo, compromissos, follow-up

**Componentes auxiliares:**
9. `ReuniaoTimer.tsx` - Timer visual para cada etapa
10. `PresencaList.tsx` - Registro de presenca por reuniao
11. `ReuniaoProgressBar.tsx` - Barra de progresso da reuniao (4 etapas)
12. `DashboardMetricas.tsx` - Frequencia media, participacao, desafios cumpridos

**Modos de visualizacao:**
- Preparacao: formulario completo editavel
- Conducao: interface simplificada mobile-first com navegacao entre 4Es, timers ativos
- Revisao: visualizacao somente leitura com metricas

---

### Fase 6: Fluxo de Navegacao

O modo "Grupo Pequeno" no seletor de modos tera comportamento diferente dos outros modos:
- Ao selecionar, em vez de abrir o chat, exibe o `GruposDashboard`
- O chat com IA continua disponivel dentro do contexto do grupo para ajudar a planejar
- A interface do AppDashboard detecta `modo === "grupo_pequeno"` e renderiza o dashboard de grupos no lugar do chat

**Estrutura no AppDashboard:**
```text
if (modo === "grupo_pequeno") {
  render <GruposDashboard />
} else {
  render <ChatMessages /> + <ChatInput />
}
```

---

### Fase 7: Exportacao

Reutilizar a infraestrutura existente (`src/lib/exportToWord.ts`) para exportar:
- Relatorio de reuniao completo (Word/PDF)
- Historico de reunioes do grupo

---

### Fase 8: Biblioteca de Conteudo

Dentro do dashboard de grupos:
- Aba "Biblioteca" com quebra-gelos favoritos, historico de textos, perguntas eficazes
- Reutilizacao de conteudo em novas reunioes

---

### Resumo de arquivos afetados

**Novos arquivos (~20+):**
- `src/types/grupos.ts`
- `src/hooks/useGrupos.ts`, `useReunioes.ts`, `useMembros.ts`, `useEdificacao.ts`
- `src/components/grupos/` (10-12 componentes)
- 1 migracao SQL grande

**Arquivos modificados:**
- `src/types/chat.ts` (substituir academico por grupo_pequeno)
- `src/pages/AppDashboard.tsx` (condicional para renderizar dashboard de grupos)
- `src/components/chat/ModoSelector.tsx` (automatico via types)
- `supabase/functions/chat/index.ts` (novo system prompt)

**Design:**
- Mobile-first, tons pasteis/terrosos
- Icones distintos para cada E (Handshake, Music, BookOpen, Rocket)
- Tema claro/escuro mantido
- Botoes grandes e acessiveis para uso durante reuniao

