
## Adicionar Seção FAQ na Landing Page

### O que será feito

Criar uma seção de Perguntas Frequentes (FAQ) na página inicial, posicionada entre a seção de Passos (StepsSection) e o CTA final. A seção usará o componente Accordion do shadcn/ui que já está instalado no projeto.

### Perguntas sugeridas

1. **O que é o Flow Builder Verse?** - Explicação geral da plataforma
2. **Preciso ter conhecimento teológico para usar?** - Acessibilidade da ferramenta
3. **A IA substitui o estudo pessoal?** - Papel complementar da IA
4. **Quais modos de assistência estão disponíveis?** - Os 5 modos (Mensagem, Exegese, Devocional, Livre, Grupos Pequenos)
5. **Posso exportar o conteúdo gerado?** - Exportação para Word/CSV
6. **É gratuito?** - Modelo de acesso
7. **Meus dados estão seguros?** - Privacidade e segurança

### Detalhes técnicos

- **Novo arquivo:** `src/components/landing/FAQSection.tsx`
  - Componente usando `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` de `@/components/ui/accordion`
  - Estilo visual consistente com as outras seções (mesmas classes de container, tipografia e espaçamento)
  - Fundo alternado: `bg-background` (seguindo o padrão alternado com StepsSection que usa `bg-muted/30`)

- **Atualização:** `src/pages/LandingPage.tsx`
  - Importar e inserir `<FAQSection />` entre `<StepsSection />` e `<CTASection />`

- **Nenhuma dependência nova** necessária -- o Accordion já está disponível no projeto
