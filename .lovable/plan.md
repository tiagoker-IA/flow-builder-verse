

## Configuracao de Testes Automatizados

Configurar um ambiente de testes profissional com Vitest e Testing Library, incluindo mocks do backend, testes unitarios e de integracao, com exemplos praticos para replicar.

### O que sera feito

#### 1. Instalar dependencias de teste

Adicionar ao `devDependencies`:
- `vitest` - Runner de testes compativel com Vite
- `@testing-library/react` - Testes de componentes React
- `@testing-library/jest-dom` - Matchers extras para DOM
- `jsdom` - Ambiente DOM simulado

#### 2. Criar configuracao do Vitest

Novo arquivo `vitest.config.ts` separado do `vite.config.ts`, com:
- Ambiente `jsdom`
- Globals habilitados (describe, it, expect sem import)
- Setup file para matchers do jest-dom
- Path alias `@/` configurado

#### 3. Criar arquivo de setup dos testes

`src/test/setup.ts` com:
- Import do `@testing-library/jest-dom`
- Mock do `matchMedia` (necessario para componentes com media queries)

#### 4. Criar mocks reutilizaveis

`src/test/mocks/supabase.ts` - Mock completo do cliente Supabase:
- `auth.getSession`, `auth.getUser`, `auth.onAuthStateChange`
- Queries `.from().select().eq()` etc.
- Storage `.upload`, `.getPublicUrl`

`src/test/mocks/data.ts` - Dados de teste:
- Usuario mockado
- Perfil mockado
- Conversas e mensagens de exemplo

#### 5. Criar testes de exemplo

**Teste unitario de utilitario** - `src/lib/utils.test.ts`:
- Testar a funcao `cn()` com diferentes inputs

**Teste unitario de tipos/constantes** - `src/types/chat.test.ts`:
- Validar que `MODOS_CHAT` tem todos os modos esperados

**Teste de componente UI** - `src/components/ui/button.test.tsx`:
- Renderizacao com variantes diferentes
- Click handler funciona
- Estado disabled

**Teste de hook** - `src/hooks/useAuth.test.ts`:
- Mock do Supabase auth
- Verificar estados loading, user, session

**Teste de integracao** - `src/pages/Auth.test.tsx`:
- Renderizacao do formulario de login
- Interacao com campos e botao de submit

#### 6. Atualizar TypeScript config

Adicionar `"vitest/globals"` ao `types` em `tsconfig.app.json` para autocomplete dos globals.

### Detalhes tecnicos

**Estrutura de pastas:**
```text
src/
  test/
    setup.ts          -- Setup global (jest-dom, matchMedia mock)
    mocks/
      supabase.ts     -- Mock do cliente Supabase
      data.ts         -- Dados de teste reutilizaveis
  lib/
    utils.test.ts     -- Teste unitario do cn()
  types/
    chat.test.ts      -- Teste das constantes
  components/
    ui/
      button.test.tsx -- Teste do componente Button
  hooks/
    useAuth.test.ts   -- Teste do hook de autenticacao
  pages/
    Auth.test.tsx     -- Teste de integracao da pagina
```

**Arquivos novos (9):**
- `vitest.config.ts`
- `src/test/setup.ts`
- `src/test/mocks/supabase.ts`
- `src/test/mocks/data.ts`
- `src/lib/utils.test.ts`
- `src/types/chat.test.ts`
- `src/components/ui/button.test.tsx`
- `src/hooks/useAuth.test.ts`
- `src/pages/Auth.test.tsx`

**Arquivos modificados (2):**
- `package.json` - Adicionar devDependencies e script `"test"`
- `tsconfig.app.json` - Adicionar `"vitest/globals"` aos types

**Nota sobre CI/CD:** GitHub Actions so pode ser configurado diretamente no repositorio GitHub. Apos conectar o projeto ao GitHub, um workflow `.github/workflows/test.yml` pode ser adicionado para rodar testes automaticamente em PRs.
