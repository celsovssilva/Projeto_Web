
# 🎟️ Entrada Express - Sistema de Gerenciamento de Eventos e Ingressos

**Entrada Express** é uma aplicação web completa para o gerenciamento de eventos e controle de ingressos. Ela permite que administradores criem, editem e gerenciem eventos, enquanto usuários podem visualizar eventos e simular a compra de ingressos com geração de um checklist de entrada.

---

## 🚀 Funcionalidades Principais

### 👥 Gerenciamento de Usuários e Autenticação
- **Cadastro de usuários:** Formulário em múltiplas etapas com validação no cliente e no servidor.
- **Login de usuários e administradores:** Cada um com rotas específicas.
- **Sessões:** Mantém usuários autenticados com `express-session`.
- **Recuperação de senha:** Fluxo completo com envio de link de redefinição via e-mail (simulado com Mailtrap).
- **Página de perfil do usuário logado.**
- **Logout seguro.**

### 🛠️ Painel do Administrador
- **Acesso restrito por autenticação e autorização.**
- **CRUD de Eventos:**
  - Criação de eventos com nome, descrição, local, data, limite de compra, preço, capacidade e status.
  - Edição e exclusão de eventos.
  - Listagem de eventos criados pelo administrador.
- **Checklist de Ingressos:**
  - Visualização de participantes de um evento.
  - Check-in de participantes.
  - Busca de participantes.

### 🎫 Compra Simulada de Ingressos
- **Listagem categorizada de eventos:** Novos, Disponíveis e Encerrados.
- **Simulação de pagamento:** Página dedicada.
- **Geração de ingresso:** Exibe detalhes com identificador único (`qrCodeString`).

---

## ⚙️ Tecnologias Utilizadas

| Categoria        | Tecnologias |
|------------------|-------------|
| **Backend**      | Node.js, Express.js |
| **Banco de Dados** | SQLite (via Prisma ORM) |
| **View Engine**  | EJS |
| **Frontend**     | HTML5, CSS3, JavaScript (vanilla), Bootstrap 4 (parcial) |
| **Sessões & Segurança** | express-session, cookie-parser, bcrypt.js, jsonwebtoken |
| **Validações**   | validator.js |
| **E-mails**      | Nodemailer (Mailtrap) |
| **UUID/Identificadores** | uuid |
| **Middlewares**  | cors, method-override, connect-flash, dotenv |

---

## 📁 Estrutura do Projeto

```
├── prisma/
│   ├── schema.prisma        # Modelos do banco de dados
│   └── migrations/          # Migrações geradas
├── public/
│   ├── css/                 # Arquivos de estilo
│   ├── js/                  # JS do lado do cliente
│   └── img/                 # Imagens estáticas
├── src/
│   ├── controllers/         # Lógica das rotas
│   ├── middleware/          # Middlewares customizados
│   └── routes/              # Arquivos de rotas
├── views/
│   ├── admin/               # Views do painel administrativo
│   └── ...                  # Demais views (login, cadastro, eventos etc.)
├── .env                     # Variáveis de ambiente (não versionar)
├── .env.example             # Modelo de arquivo .env
├── .gitignore
├── index.js                 # Arquivo principal da aplicação
├── package.json
└── package-lock.json
```

---

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos
- Node.js (recomendado: versão 16.x ou superior)
- npm ou Yarn

### 2. Clonagem do Repositório
```bash
git clone <url_do_repositorio>
cd <nome_da_pasta>
```

### 3. Instalar Dependências
```bash
npm install
# ou
yarn install
```

### 4. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz baseado no `.env.example`:

```env
# Banco de Dados
DATABASE_URL="file:./dev.db"

# Segredos
JWT_SECRET="seu_jwt_secret"
SESSION_SECRET="seu_session_secret"
COOKIE_SECRET="seu_cookie_secret"

# App
APP_URL="http://localhost:3000"
PORT=3000

# E-mail (Mailtrap)
EMAIL_HOST="sandbox.smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER="usuario_mailtrap"
EMAIL_PASS="senha_mailtrap"
EMAIL_FROM="Entrada Express <naoresponda@entradaexpress.com>"
```

---

## 🛠️ Configurar o Banco de Dados com Prisma

### 1. Rodar migrações
```bash
npx prisma migrate dev
```

### 2. Gerar o Prisma Client
```bash
npx prisma generate
```

---

## ▶️ Executando a Aplicação

```bash
npm start
# ou
node index.js
```

Acesse em seu navegador:

- Página de eventos: [http://localhost:3000/api/events](http://localhost:3000/api/events)
- Login: [http://localhost:3000/api/login](http://localhost:3000/api/login)
- Painel do Admin: [http://localhost:3000/api/admin/events](http://localhost:3000/api/admin/events)

---

## 🔗 Rotas Principais da API

### 👤 Usuário & Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/userCad` | Formulário de cadastro |
| POST | `/userCad` | Cria usuário |
| GET | `/login` | Tela de login |
| POST | `/login` | Login |
| GET | `/logout` | Logout |
| GET | `/forgot-password` | Solicitar redefinição |
| POST | `/forgot-password` | Processar redefinição |
| GET | `/reset-password` | Formulário com token |
| POST | `/reset-password` | Nova senha |
| GET | `/dataUser` | Dados do usuário logado |

### 🛠️ Administrador
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/admin/register` | Criação de admin |
| POST | `/loginAdmin` | Login de admin |
| GET | `/admin/events` | Lista eventos |
| POST | `/admin/events` | Cria evento |
| PATCH | `/admin/events/:eventId` | Atualiza evento |
| DELETE | `/admin/events/:eventId` | Deleta evento |
| GET | `/admin/event/:eventId/checklist` | Ver checklist |
| POST | `/admin/ticket/:ticketId/checkin` | Processar check-in |

### 📆 Eventos & Ingressos (Público)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/events` | Lista eventos públicos |
| GET | `/pagamento-fake` | Tela de simulação |
| POST | `/events/:eventId/processar-compra` | Processar compra fake |

---

## 📝 Licença

Este projeto é de uso educacional e está licenciado sob os termos que você definir. Adicione uma seção de licença se necessário.

---

## 📫 Contato

Dúvidas ou sugestões? Fique à vontade para abrir uma *issue* ou entrar em contato!
