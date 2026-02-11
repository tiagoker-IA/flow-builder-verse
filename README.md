# ✝️ Flow Builder Verse

> Assistente de IA para criação de textos teológicos e bíblicos — sermões, exegeses, devocionais e estudos acadêmicos.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📖 Sobre o Projeto

O **Flow Builder Verse** é uma aplicação web que utiliza inteligência artificial para auxiliar pastores, teólogos e estudantes na elaboração de textos bíblicos de alta qualidade. A ferramenta oferece modos especializados de interação, cada um adaptado a um tipo específico de produção textual.

## ✨ Funcionalidades

- **🗣️ Modo Mensagem** — Fluxo guiado em 7 etapas para preparação de sermões reformados
- **📖 Modo Exegese** — Análise profunda e contextualizada de textos bíblicos
- **❤️ Modo Devocional** — Reflexões pessoais e aplicações práticas
- **🎓 Modo Acadêmico** — Estudos teológicos com rigor formal
- **💬 Modo Livre** — Conversa aberta sobre temas bíblicos
- **📄 Exportação para Word** — Exporte conversas em `.docx` com formatação profissional
- **📋 Copiar como Rich Text** — Cole diretamente em processadores de texto
- **🌗 Tema claro e escuro** — Alternância automática ou manual
- **📊 Painel Administrativo** — Estatísticas de uso, gestão de usuários e campanhas de e-mail
- **💡 Sistema de Feedback** — Envio de bugs e sugestões diretamente pela interface

## 🛠️ Stack Tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Estilização** | Tailwind CSS, shadcn/ui |
| **Backend** | Lovable Cloud (Auth, Database, Edge Functions) |
| **IA** | Lovable AI Gateway (Gemini 2.5 Flash) |
| **Gráficos** | Recharts |
| **Exportação** | docx, file-saver |

## 🚀 Como Começar

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

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=<sua_url>
VITE_SUPABASE_PUBLISHABLE_KEY=<sua_chave_publica>
```

> ⚠️ Nunca compartilhe chaves privadas ou de serviço em repositórios públicos.

## 📁 Estrutura de Pastas

```
src/
├── components/         # Componentes reutilizáveis
│   ├── admin/          # Componentes do painel administrativo
│   ├── chat/           # Interface de chat (input, mensagens, sidebar)
│   ├── feedback/       # Formulário e botão de feedback
│   ├── landing/        # Seções da landing page
│   └── ui/             # Componentes base (shadcn/ui)
├── hooks/              # Custom hooks (auth, chat, conversas, tema)
├── integrations/       # Configuração do cliente backend
├── lib/                # Utilitários (exportação, helpers)
├── pages/              # Páginas da aplicação
└── types/              # Tipagens TypeScript
```

## 🗺️ Rotas da Aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Landing page pública |
| `/auth` | Login e cadastro |
| `/app` | Interface principal de chat com IA |
| `/admin` | Painel administrativo (acesso restrito) |

## 🤝 Como Contribuir

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto ainda não possui uma licença definida. Adicione um arquivo `LICENSE` conforme sua preferência.

---

<p align="center">
  Feito com ❤️ usando <a href="https://lovable.dev">Lovable</a>
</p>
