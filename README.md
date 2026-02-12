# 🙏 Flow Builder Verse

> **Assistente de IA que ajuda pastores e líderes a preparar pregações, exegeses e estudos bíblicos de qualidade, enquanto aprendem e se aprimoram no processo.**

---

## 🎯 Para Quem É?

**Flow Builder Verse** é feito para:

- 🎤 **Pastores** que preparam pregações semanais
- 📖 **Professores de EBD** que criam estudos bíblicos
- 👥 **Líderes de células** que facilitam grupos pequenos
- 📚 **Estudantes de teologia** que querem aprender exegese
- 💬 **Pregadores iniciantes** que buscam aprimoramento

---

## ❓ Qual Problema Resolve?

### **Antes (Sem Flow Builder Verse):**

❌ Horas preparando uma pregação
❌ Dificuldade com exegese e contexto histórico
❌ Não sabe por onde começar
❌ Conteúdo superficial ou repetitivo
❌ Falta de fontes confiáveis

### **Depois (Com Flow Builder Verse):**

✅ Estrutura de pregação em minutos
✅ Exegese profunda e acessível
✅ Metodologia clara de preparação
✅ Conteúdo rico e bem fundamentado
✅ Aprende enquanto cria

---

## ✨ Funcionalidades

### 🗣️ **Modo Mensagem**

Fluxo guiado em 7 etapas para preparação de sermões reformados:

- Estrutura completa de pregação
- Insights exegéticos e teológicos
- Ilustrações práticas e aplicações

### 📖 **Modo Exegese**

Análise profunda de passagens bíblicas:

- Contexto histórico e cultural
- Análise do texto original (hebraico/grego)
- Teologia do texto
- Aplicação contemporânea

### ❤️ **Modo Devocional**

Reflexões pessoais e aplicações práticas:

- Meditações guiadas em textos bíblicos
- Aplicações pessoais e comunitárias

### 💬 **Modo Livre**

Conversa aberta sobre temas bíblicos e teológicos — pergunte o que quiser.

### 👥 **Grupos Pequenos**

Gestão completa de células e grupos de estudo:

- Planejamento de reuniões com metodologia 4Es (Encontro, Exaltação, Edificação, Envio)
- Controle de presença e membros
- Quebra-gelos favoritos

### 📄 **Exportação**

- Exporte conversas em `.docx` com formatação profissional
- Copie como Rich Text para colar em processadores de texto

### 📊 **Painel Administrativo**

- Estatísticas de uso e comportamento
- Gestão de usuários
- Campanhas de e-mail
- Visualização de feedbacks

---

## 🚀 Como Usar

### 1️⃣ Acesse a Plataforma

👉 [flow-builder-verse.lovable.app](https://flow-builder-verse.lovable.app)

### 2️⃣ Crie uma Conta

Registre-se com seu email e confirme pelo link enviado.

### 3️⃣ Escolha um Modo

| Modo | O que faz |
|------|-----------|
| 🗣️ Mensagem | Pregações com fluxo guiado em 7 etapas |
| 📖 Exegese | Análise profunda de textos bíblicos |
| ❤️ Devocional | Reflexões pessoais e aplicações práticas |
| 💬 Livre | Conversa aberta sobre temas bíblicos |

### 4️⃣ Comece a Criar

Insira o tema ou referência bíblica e a IA te guia no processo.

---

## 🗺️ Rotas da Aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Landing page pública |
| `/auth` | Login e cadastro |
| `/app` | Interface principal de chat com IA |
| `/app/grupos` | Gestão de grupos pequenos |
| `/admin` | Painel administrativo (acesso restrito) |
| `/perfil` | Perfil do usuário |

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Estilização** | Tailwind CSS, shadcn/ui |
| **Backend** | Lovable Cloud (Auth, Database, Edge Functions) |
| **IA** | Lovable AI Gateway (Gemini 2.5 Flash) |
| **Gráficos** | Recharts |
| **Exportação** | docx, file-saver |

## 💻 Desenvolvimento Local

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- npm ou bun

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Acesse a pasta do projeto
cd flow-builder-verse

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=<sua_url>
VITE_SUPABASE_PUBLISHABLE_KEY=<sua_chave_publica>
```

> ⚠️ Nunca compartilhe chaves privadas ou de serviço em repositórios públicos.

---

## 📁 Estrutura de Pastas

```
src/
├── components/         # Componentes reutilizáveis
│   ├── admin/          # Painel administrativo
│   ├── chat/           # Interface de chat (input, mensagens, sidebar)
│   ├── feedback/       # Formulário e botão de feedback
│   ├── grupos/         # Gestão de grupos pequenos
│   ├── landing/        # Seções da landing page
│   └── ui/             # Componentes base (shadcn/ui)
├── hooks/              # Custom hooks (auth, chat, conversas, tema)
├── integrations/       # Configuração do cliente backend
├── lib/                # Utilitários (exportação, helpers)
├── pages/              # Páginas da aplicação
└── types/              # Tipagens TypeScript
```

---

## 🤝 Como Contribuir

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto ainda não possui uma licença definida. Adicione um arquivo `LICENSE` conforme sua preferência.

---

<p align="center">
  Feito com ❤️ usando <a href="https://lovable.dev">Lovable</a>
</p>
