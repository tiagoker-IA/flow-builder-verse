

## Otimizacao de Performance

### 1. Code Splitting com Lazy Loading

Todas as 4 paginas sao importadas estaticamente no `App.tsx`. Vamos usar `React.lazy()` + `Suspense` para carregar cada rota sob demanda, reduzindo o bundle inicial.

**Paginas para lazy loading:**
- `LandingPage` (inclui 7 sub-componentes de landing)
- `Auth`
- `AppDashboard` (a mais pesada: chat, sidebar, hooks)
- `AdminDashboard` (inclui Recharts, tabelas, formularios)

**Componente de fallback:** Um spinner centralizado reutilizavel, consistente com o loading ja usado no `AppDashboard`.

### 2. Otimizacao do React Query

O `QueryClient` atual usa configuracao padrao. Vamos adicionar:
- `staleTime: 5 * 60 * 1000` (5 min) para dados que nao mudam frequentemente
- `gcTime: 10 * 60 * 1000` para manter cache por mais tempo
- `refetchOnWindowFocus: false` para evitar re-fetches desnecessarios

### 3. Skeleton Loading para Admin

O painel admin mostra apenas um spinner generico. Vamos adicionar skeletons profissionais para:
- Cards de estatisticas (4 cards com skeleton)
- Graficos (area retangular com skeleton)
- Tabela de usuarios (linhas com skeleton)

### 4. O que NAO sera feito (e por que)

- **Otimizacao de imagens**: O projeto nao usa imagens pesadas, apenas icones SVG do Lucide
- **Tree-shaking**: Ja esta configurado pelo Vite por padrao
- **Metricas antes/depois**: Nao e possivel medir bundle size dentro do Lovable, mas o code splitting reduzira o carregamento inicial significativamente
- **Remover dependencias**: Todas as dependencias instaladas estao sendo utilizadas

### Detalhes tecnicos

**Arquivos modificados:**

1. **`src/App.tsx`**
   - Substituir imports estaticos por `React.lazy()`
   - Envolver `Routes` com `Suspense` e fallback de loading

2. **`src/components/ui/PageLoader.tsx`** (novo)
   - Componente de loading reutilizavel com spinner + texto
   - Usado como fallback do Suspense

3. **`src/App.tsx`** - Configuracao do QueryClient
   - Adicionar `defaultOptions` com staleTime, gcTime e refetchOnWindowFocus

4. **`src/components/admin/AdminSkeleton.tsx`** (novo)
   - Skeleton para cards de estatisticas
   - Skeleton para area de graficos
   - Skeleton para linhas de tabela

5. **`src/pages/AdminDashboard.tsx`**
   - Substituir o spinner generico pelo `AdminSkeleton` durante carregamento

