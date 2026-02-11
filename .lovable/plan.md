

## Correcao: Esqueci minha senha

### Problema
O email de recuperacao e enviado com sucesso, mas quando o usuario clica no link e volta para `/auth`, a pagina nao reconhece que e um fluxo de redefinicao de senha. Em vez de mostrar um formulario para a nova senha, ela detecta a sessao e redireciona direto para `/app`.

### Solucao
Adicionar um novo modo `"update-password"` na pagina Auth que:
1. Detecta o evento `PASSWORD_RECOVERY` no `onAuthStateChange`
2. Mostra um formulario com campos "Nova senha" e "Confirmar nova senha"
3. Usa `supabase.auth.updateUser({ password })` para salvar
4. Apos sucesso, redireciona para `/app`

### Mudancas no arquivo `src/pages/Auth.tsx`

**1. Novo modo no state:**
- Alterar o tipo do mode para incluir `"update-password"`
- Adicionar state `newPassword` e `confirmNewPassword`

**2. Detectar evento de recuperacao:**
- No `onAuthStateChange`, verificar se `event === "PASSWORD_RECOVERY"`
- Quando detectado, setar `mode` para `"update-password"` em vez de redirecionar

**3. Formulario de nova senha:**
- Mostrar dois campos de senha quando `mode === "update-password"`
- Validar que as senhas coincidem e tem pelo menos 6 caracteres
- Chamar `supabase.auth.updateUser({ password: newPassword })`
- Mostrar toast de sucesso e redirecionar para `/app`

**4. UI do formulario:**
- Titulo: "Redefinir senha"
- Descricao: "Digite sua nova senha"
- Botoes de mostrar/ocultar senha nos campos
- Botao "Salvar nova senha"

### Detalhes tecnicos

```text
onAuthStateChange callback:
  if (event === "PASSWORD_RECOVERY") -> setMode("update-password"), NÃO redirecionar
  else if (session?.user) -> navigate("/app")

handleUpdatePassword:
  1. Validar newPassword === confirmNewPassword
  2. Validar newPassword.length >= 6
  3. supabase.auth.updateUser({ password: newPassword })
  4. toast sucesso
  5. navigate("/app")
```

**Arquivo modificado:** `src/pages/Auth.tsx` (unico arquivo)
