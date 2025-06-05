# Entrada Express - Sistema de Gerenciamento de Eventos e Ingressos

Bem-vindo ao Entrada Express! Esta é uma aplicação web desenvolvida para gerenciar eventos, permitir que administradores criem e controlem esses eventos, e que usuários visualizem eventos e simulem a "compra" de ingressos, culminando em um sistema de checklist para controle de entrada.

## Funcionalidades Principais

### Gerenciamento de Usuários e Autenticação
* **Cadastro de Usuários:** Formulário de múltiplas etapas com validação no cliente e no servidor.
* **Login:** Para usuários comuns e administradores (com rota dedicada para admin).
* **Sessões de Usuário:** Gerenciamento de sessão para manter os usuários logados.
* **Recuperação de Senha:** Fluxo completo com envio de link de redefinição por e-mail (simulado via Mailtrap em desenvolvimento).
* **Página de Dados do Usuário:** Exibe informações do usuário logado.
* **Logout.**

### Painel do Administrador
* **Autenticação e Autorização:** Rotas protegidas para garantir que apenas administradores logados acessem o painel.
* **Gerenciamento de Eventos (CRUD):**
    * Criar novos eventos com detalhes como nome, descrição, endereço, data do evento, data limite para compra de ingressos, preço do ingresso, número máximo de ingressos e status (Ativo/Fechado).
    * Listar todos os eventos criados pelo administrador.
    * Atualizar os detalhes de eventos existentes.
    * Excluir eventos.
* **Checklist de Eventos:**
    * Visualizar uma lista de todos os participantes (usuários que "compraram" ingressos) para um evento específico.
    * Marcar participantes como "check-in realizado" ou desfazer o check-in.
    * Busca de participantes na lista de checklist.

### Fluxo de "Compra" de Ingressos para Usuários
* **Listagem de Eventos:** Usuários podem visualizar eventos categorizados em "Novos", "Disponíveis" e "Encerrados".
* **Simulação de Pagamento:** Ao "Comprar Ingresso", o usuário é direcionado para uma página de simulação de pagamento.
* **Confirmação de Ingresso:** Após a "confirmação do pagamento fake", uma tela exibe os detalhes do ingresso adquirido (ID do ingresso, informações do evento, dados do comprador). O sistema gera um identificador único para o ingresso (`qrCodeString`) internamente, embora a imagem do QR Code não seja mais o foco principal na tela de confirmação do usuário.

### Backend e Validações
* Validações robustas no backend para todos os inputs de formulário (criação de usuário, admin, evento, login, reset de senha).
* Uso de hashing para senhas (`bcrypt.js`).
* Geração de tokens JWT para o processo de redefinição de senha.

## Tecnologias Utilizadas

* **Backend:** Node.js, Express.js
* **Banco de Dados:** SQLite
* **ORM:** Prisma
* **View Engine:** EJS (Embedded JavaScript templates)
* **Autenticação/Sessão:** `express-session`, `cookie-parser`, `bcrypt.js`, `jsonwebtoken`
* **E-mail:** Nodemailer (configurado para Mailtrap em desenvolvimento)
* **Validação:** `validator.js`
* **Identificadores Únicos:** `uuid` (para `qrCodeString` nos tickets)
* **Frontend:** HTML5, CSS3, JavaScript (vanilla JS para interações de cliente, Fetch API)
* **CSS Framework (parcial):** Bootstrap 4 (usado em algumas telas de admin)
* **Outros Middlewares:** `cors`, `method-override`, `connect-flash`, `dotenv`

## Estrutura do Projeto (Visão Geral)

```
├── prisma/
│   ├── schema.prisma     # Define os modelos do banco de dados
│   └── migrations/       # Contém os arquivos de migração do banco
├── public/
│   ├── css/              # Arquivos CSS
│   ├── js/               # Arquivos JavaScript do lado do cliente
│   └── img/              # Imagens estáticas
├── src/
│   ├── controllers/      # Lógica de negócio para as rotas
│   ├── Middleware/       # Middlewares customizados (ex: authMiddleware.js)
│   └── routes/           # Definições de rotas da aplicação
├── views/
│   ├── admin/            # Views EJS específicas do painel admin
│   └── ...               # Outras views EJS (login, cadastro, eventos, etc.)
├── .env                  # Arquivo para variáveis de ambiente (NÃO VERSIONAR COM DADOS SENSÍVEIS)
├── .env.example          # Exemplo de arquivo .env (RECOMENDADO)
├── .gitignore
├── index.js              # Ponto de entrada principal da aplicação
├── package.json
└── package-lock.json
```

## Configuração e Instalação

1.  **Pré-requisitos:**
    * Node.js (versão 16.x ou superior recomendada)
    * npm (geralmente vem com o Node.js) ou Yarn

2.  **Clonar o Repositório (se aplicável):**
    ```bash
    git clone <url_do_seu_repositorio>
    cd <nome_da_pasta_do_projeto>
    ```

3.  **Instalar Dependências:**
    ```bash
    npm install
    ```
    Ou se usar Yarn:
    ```bash
    yarn install
    ```

4.  **Configurar Variáveis de Ambiente:**
    * Crie um arquivo chamado `.env` na raiz do projeto.
    * Adicione as seguintes variáveis, substituindo pelos seus valores apropriados (especialmente para produção):
        ```env
        # Banco de Dados (SQLite)
        DATABASE_URL="file:./dev.db"

        # Segredos da Aplicação (use geradores de string aleatória para valores fortes)
        JWT_SECRET="seu_jwt_secret_super_longo_e_aleatorio_aqui"
        SESSION_SECRET="seu_session_secret_super_longo_e_aleatorio_aqui"
        COOKIE_SECRET="seu_cookie_secret_super_longo_e_aleatorio_aqui"

        # URL Base da Aplicação e Porta
        APP_URL="http://localhost:3000" # Mude para a URL de produção se fizer deploy
        PORT=3000

        # Configurações de E-mail (Exemplo para Mailtrap)
        EMAIL_HOST="sandbox.smtp.mailtrap.io"
        EMAIL_PORT=2525 # Verifique as configurações do Mailtrap (2525/587 com EMAIL_SECURE=false ou 465 com EMAIL_SECURE=true)
        EMAIL_SECURE=false # Para Mailtrap com porta 2525/587 (STARTTLS). Mude para true se usar porta 465 (SSL/TLS).
        EMAIL_USER="seu_usuario_mailtrap_aqui"
        EMAIL_PASS="sua_senha_mailtrap_aqui"
        EMAIL_FROM="Entrada Express <naoresponda@entradaexpress.com>"

        # Opcional: Para desenvolvimento local com certos provedores de email (use com cautela)
        # NODE_TLS_REJECT_UNAUTHORIZED=0
        ```

5.  **Configurar o Banco de Dados com Prisma:**
    * Aplique as migrações para criar as tabelas no seu banco de dados:
        ```bash
        npx prisma migrate dev
        ```
        (Se for a primeira vez, ele pedirá um nome para a migração inicial).
    * Gere o Prisma Client:
        ```bash
        npx prisma generate
        ```

## Executando a Aplicação

1.  **Iniciar o Servidor:**
    ```bash
    node index.js
    ```
    Ou, se você configurar um script no `package.json` (ex: `"start": "node index.js"`):
    ```bash
    npm start
    ```
2.  **Acessar no Navegador:**
    * Página de listagem de eventos para usuários: `http://localhost:3000/api/events` (ou o endereço configurado em `APP_URL` e `PORT`)
    * Página de login: `http://localhost:3000/api/login`
    * Painel do Admin (após login como admin): `http://localhost:3000/api/admin/events`

## Rotas Principais da API (prefixo `/api` geralmente)

* **Usuário/Autenticação:**
    * `GET /userCad`: Exibe formulário de cadastro de usuário.
    * `POST /userCad`: Cria novo usuário.
    * `GET /login`: Exibe formulário de login.
    * `POST /login`: Realiza login de usuário/admin (se o controller geral ainda suportar admin, caso contrário, use a rota de admin).
    * `GET /logout`: Realiza logout.
    * `GET /forgot-password`: Exibe formulário para solicitar redefinição de senha.
    * `POST /forgot-password`: Processa solicitação de redefinição.
    * `GET /reset-password`: Exibe formulário para nova senha (com token na URL).
    * `POST /reset-password`: Processa redefinição da senha.
    * `GET /dataUser`: Exibe página de dados do usuário logado.

* **Administrador:**
    * `POST /admin/register`: Criar novo administrador (verificar se esta rota deve ser protegida).
    * `POST /loginAdmin`: Login específico para administrador.
    * `GET /admin/events`: Listar eventos do admin.
    * `POST /admin/events`: Criar novo evento.
    * `PATCH /admin/events/:eventId`: Atualizar evento.
    * `DELETE /admin/events/:eventId`: Deletar evento.
    * `GET /admin/event/:eventId/checklist`: Exibir checklist do evento.
    * `POST /admin/ticket/:ticketId/checkin`: Processar check-in do ingresso.

* **Eventos (Público) e Ingressos:**
    * `GET /events`: Listar eventos para visualização do usuário.
    * `GET /pagamento-fake`: Exibir página de simulação de pagamento (acionada após "Comprar Ingresso").
    * `POST /events/:eventId/processar-compra`: Processar a "compra" do ingresso após pagamento fake.
