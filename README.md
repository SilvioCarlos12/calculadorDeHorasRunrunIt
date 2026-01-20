# Runrit

Dashboard de produtividade integrado com a API do Runrun.it para visualização de horas trabalhadas, tarefas e métricas de produtividade.

## 📋 Sobre o Projeto

O **Runrit** é uma aplicação web moderna que funciona como um dashboard personalizado para o Runrun.it, permitindo que você visualize de forma clara e organizada:

- **Horas trabalhadas** no mês atual com cálculo de valor
- **Tarefas atrasadas** que precisam de atenção
- **Suas tarefas** com filtros e busca
- **Métricas de produtividade** e progresso mensal

A aplicação se conecta diretamente à API do Runrun.it para buscar dados em tempo real e apresenta tudo em uma interface intuitiva e moderna.

## ✨ Funcionalidades

### Dashboard Principal
- **Resumo de Horas**: Visualização das horas trabalhadas no mês atual
  - Cálculo automático do valor baseado em valor/hora configurável
  - Barra de progresso para meta mensal (176h)
  - Estatísticas detalhadas (horas, minutos, dias trabalhados)

- **Tarefas Atrasadas**: Lista de tarefas que ultrapassaram a data desejada
  - Identificação visual de urgência
  - Informações completas de cada tarefa

- **Minhas Tarefas**: Gerenciamento completo de suas tarefas
  - Filtros: Abertas, Concluídas ou Todas
  - Busca por título, projeto ou cliente
  - Visualização detalhada de cada tarefa

### Autenticação
- Login seguro via App-Key e User-Token
- Armazenamento local das credenciais (localStorage)
- Validação automática das credenciais
- Redirecionamento automático se já autenticado

## 🛠️ Tecnologias Utilizadas

- **[SvelteKit](https://kit.svelte.dev/)** - Framework web moderno e performático
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática para JavaScript
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Vite](https://vitejs.dev/)** - Build tool e dev server rápido
- **API Runrun.it** - Integração com a API oficial do Runrun.it

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** ou **pnpm** (gerenciador de pacotes)
- **Conta no Runrun.it** com acesso à API
- **App-Key e User-Token** do Runrun.it (veja como obter abaixo)

## 🚀 Instalação

1. **Clone o repositório** (ou baixe o projeto):
   ```bash
   git clone <url-do-repositorio>
   cd runrit
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**:
   Abra seu navegador em `http://localhost:5173` (ou a porta indicada no terminal)

## 🔐 Como Fazer Login

Para usar a aplicação, você precisa de credenciais da API do Runrun.it. Siga os passos abaixo:

### Passo 1: Obter as Credenciais da API

1. Acesse a [documentação da API do Runrun.it](https://runrun.it/api/documentation)
2. Faça login na sua conta do Runrun.it
3. Navegue até a seção de **API** ou **Integrações**
4. Você encontrará duas credenciais importantes:
   - **App-Key**: Chave da aplicação (identifica sua aplicação)
   - **User-Token**: Token do usuário (identifica você como usuário)

   > **Nota**: Se você não encontrar essas credenciais, verifique se sua conta tem permissão para acessar a API. Alguns planos do Runrun.it podem ter restrições.

### Passo 2: Iniciar a Aplicação

1. Certifique-se de que o servidor de desenvolvimento está rodando:
   ```bash
   npm run dev
   ```

2. Abra seu navegador e acesse `http://localhost:5173`

### Passo 3: Acessar a Página de Login

Ao acessar a aplicação pela primeira vez, você será direcionado automaticamente para a página de login. Se você já estiver autenticado, será redirecionado para o dashboard.

### Passo 4: Preencher os Campos

Na página de login, você verá dois campos:

1. **App-Key**: Cole ou digite sua App-Key do Runrun.it
2. **User-Token**: Cole ou digite seu User-Token do Runrun.it

   > **Dica**: O campo User-Token é do tipo senha (oculto) por segurança.

### Passo 5: Fazer Login

1. Clique no botão **"Entrar"** ou pressione **Enter**
2. A aplicação irá:
   - Validar suas credenciais com a API do Runrun.it
   - Buscar suas informações de usuário
   - Salvar as credenciais localmente (no navegador)
   - Redirecionar você para o dashboard

### Passo 6: Usar o Dashboard

Após o login bem-sucedido, você será redirecionado para o dashboard, onde poderá:

- Visualizar suas horas trabalhadas no mês
- Ver tarefas atrasadas
- Gerenciar suas tarefas
- Configurar o valor/hora para cálculos financeiros

### Problemas Comuns

**Erro: "Credenciais inválidas"**
- Verifique se copiou corretamente a App-Key e o User-Token
- Certifique-se de que não há espaços extras antes ou depois
- Confirme que suas credenciais ainda estão válidas no Runrun.it

**Erro: "Erro ao conectar com a API"**
- Verifique sua conexão com a internet
- Confirme que a API do Runrun.it está funcionando
- Tente novamente após alguns instantes

**Não consigo encontrar minhas credenciais**
- Acesse: https://runrun.it/api/documentation
- Entre em contato com o suporte do Runrun.it se necessário
- Verifique se seu plano permite acesso à API

## 🏗️ Como Funciona

### Arquitetura

A aplicação segue uma arquitetura modular baseada em SvelteKit:

```
src/
├── lib/
│   ├── api/          # Integração com a API do Runrun.it
│   ├── components/   # Componentes reutilizáveis
│   └── stores/       # Gerenciamento de estado (autenticação)
└── routes/           # Páginas da aplicação
    ├── +page.svelte  # Página de login
    └── dashboard/    # Dashboard principal
```

### Fluxo de Autenticação

1. **Login**: Usuário insere App-Key e User-Token
2. **Validação**: Aplicação valida as credenciais chamando a API do Runrun.it
3. **Armazenamento**: Credenciais válidas são salvas no `localStorage` do navegador
4. **Estado Global**: Store de autenticação (`auth.ts`) gerencia o estado da sessão
5. **Proteção de Rotas**: Dashboard verifica autenticação antes de carregar dados

### Integração com a API

A aplicação utiliza os seguintes endpoints da API do Runrun.it:

- `GET /users/me` - Obter informações do usuário atual
- `GET /manual_work_periods` - Buscar períodos de trabalho manual
- `GET /tasks` - Listar tarefas do usuário

Todas as requisições incluem os headers:
- `App-Key`: Sua chave de aplicação
- `User-Token`: Seu token de usuário

### Armazenamento Local

As credenciais são armazenadas no `localStorage` do navegador com a chave `runrun_auth`. Isso permite que você permaneça logado mesmo após fechar o navegador.

> **Importante**: As credenciais são armazenadas apenas localmente no seu navegador. Elas não são enviadas para nenhum servidor externo além da API oficial do Runrun.it.

## 📁 Estrutura do Projeto

```
runrit/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   └── runrun.ts          # Cliente da API do Runrun.it
│   │   ├── components/
│   │   │   ├── HoursCard.svelte   # Card de horas trabalhadas
│   │   │   ├── MyTasksCard.svelte # Card de minhas tarefas
│   │   │   ├── OverdueTasksCard.svelte # Card de tarefas atrasadas
│   │   │   ├── TaskItem.svelte    # Item individual de tarefa
│   │   │   └── ui/                # Componentes de UI reutilizáveis
│   │   └── stores/
│   │       └── auth.ts            # Store de autenticação
│   ├── routes/
│   │   ├── +layout.svelte         # Layout principal
│   │   ├── +page.svelte           # Página de login
│   │   └── dashboard/
│   │       └── +page.svelte       # Dashboard principal
│   ├── app.css                    # Estilos globais
│   └── app.html                   # Template HTML base
├── static/                        # Arquivos estáticos
├── package.json                   # Dependências e scripts
├── svelte.config.js             # Configuração do SvelteKit
├── vite.config.ts                 # Configuração do Vite
└── tsconfig.json                  # Configuração do TypeScript
```

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria uma build de produção
- `npm run preview` - Preview da build de produção
- `npm run check` - Verifica erros de TypeScript
- `npm run check:watch` - Verifica erros em modo watch

## 🔒 Segurança

- As credenciais são armazenadas apenas localmente no navegador
- Nenhuma informação é enviada para servidores externos além da API oficial do Runrun.it
- As requisições são feitas diretamente do navegador para a API do Runrun.it
- O User-Token é tratado como senha e não é exibido em texto claro

## 📝 Licença

Este projeto é de uso pessoal/privado.

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões e melhorias são bem-vindas!

## 📞 Suporte

Para problemas relacionados à API do Runrun.it, consulte:
- [Documentação da API](https://runrun.it/api/documentation)
- [Suporte do Runrun.it](https://runrun.it/support)

---

Desenvolvido com ❤️ usando SvelteKit
