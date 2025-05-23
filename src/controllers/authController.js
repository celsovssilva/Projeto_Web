import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password e role são obrigatórios" });
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
      return res.status(400).json({ error: "Role inválido. Use 'user' ou 'admin'" });
    }

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Remove o campo senha do retorno
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: userWithoutPassword,
      type: userType
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};