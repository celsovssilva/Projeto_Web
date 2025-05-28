import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).render("login", { erro: "Email, password e tipo são obrigatórios" });
  }

  try {
    let user;
    let userType;

    if (role === "user") {
      user = await prisma.usuario.findUnique({ where: { email } });
      userType = "usuario";
    } else if (role === "admin") {
      user = await prisma.Admin.findUnique({ where: { email } });
      userType = "admin";
    } else {
      return res.status(400).render("login", { erro: "Tipo inválido. Use 'user' ou 'admin'" });
    }

    if (!user) {
      return res.status(404).render("login", { erro: "Usuário não encontrado" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).render("login", { erro: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );
    const { password: _, ...userWithoutPassword } = user;
    return res.redirect("/dashboard");
    
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).render("login", { erro: "Erro interno do servidor" });
  }
};
