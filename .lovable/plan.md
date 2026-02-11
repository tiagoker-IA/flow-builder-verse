

## Adicionar botao de visualizar senha

Adicionar um icone de "olho" ao lado dos campos de senha na tela de login/cadastro, permitindo alternar entre visualizar e ocultar o texto digitado.

### O que sera feito

- Nos campos **Senha** e **Confirmar Senha** da pagina de autenticacao, sera adicionado um botao com icone de olho (Eye/EyeOff do Lucide) que alterna o tipo do input entre `password` e `text`.
- Cada campo tera seu proprio estado de visibilidade independente.

### Detalhes tecnicos

**Arquivo:** `src/pages/Auth.tsx`

1. Adicionar dois estados: `showPassword` e `showConfirmPassword` (booleanos, iniciam `false`).
2. Importar os icones `Eye` e `EyeOff` do `lucide-react`.
3. Envolver cada campo de senha em um `div` com `relative` e adicionar um botao posicionado a direita dentro do input que alterna o estado correspondente.
4. O `type` do input sera condicional: `showPassword ? "text" : "password"`.
5. O botao tera `type="button"` para nao submeter o formulario.

Nenhuma alteracao no backend ou banco de dados e necessaria.

