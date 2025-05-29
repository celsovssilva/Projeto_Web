import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";

import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import passwordRoutes from "./src/routes/passwordRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do EJS e diretório de views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares básicos
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // Use method-override
app.use(express.static(path.join(__dirname, "public")));

// O cookie-parser deve vir antes da sessão
app.use(cookieParser());

// Configuração da sessão
app.use(session({
  secret: "mySecretKey",  // utilize uma chave forte em produção
  resave: false,
  saveUninitialized: true
}));

// Configuração das mensagens flash
app.use(flash());

// Middleware para simular um usuário logado para teste
app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = { id: 1, name: "Admin" };
  }
  console.log("Usuário na sessão:", req.session.user);
  next();
});

// Monta as rotas (prefira utilizar prefixos que facilitem a organização)
app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api", authRoutes);
app.use("/api", passwordRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
