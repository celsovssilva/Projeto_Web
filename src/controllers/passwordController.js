import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken"; 

const prisma = new PrismaClient();

const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

const sendPasswordResetEmail = async (email, token, role) => {
  console.log(`Enviando email de reset de senha para: ${email} com token: ${token} para ${role}`);
};

export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email e role são obrigatórios." });
  }

  try {
    let user;
    let model;
    if (role === "user") {
      user = await prisma.usuario.findUnique({ where: { email } });
      model = prisma.usuario;
    } else if (role === "admin") {
      user = await prisma.Admin.findUnique({ where: { email } });
      model = prisma.Admin;
    } else {
      return res.status(400).json({ error: "Role inválido." });
    }

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const resetToken = generateResetToken();
    const passwordResetExpires = new Date();
    passwordResetExpires.setHours(passwordResetExpires.getHours() + 1); 

    await model.update({
      where: { email: user.email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: passwordResetExpires,
      },
    });

    await sendPasswordResetEmail(user.email, resetToken, role);

    res.json({ message: "Um link para redefinir sua senha foi enviado para o seu email." });

  } catch (error) {
    console.error("Erro ao solicitar reset de senha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password, role } = req.body;

  if (!token || !password || !role) {
    return res.status(400).json({ error: "Token, nova senha e role são obrigatórios." });
  }

  try {
    let user;
    let model;
    if (role === "user") {
      user = await prisma.usuario.findUnique({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });
      model = prisma.usuario;
    } else if (role === "admin") {
      user = await prisma.Admin.findUnique({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });
      model = prisma.Admin;
    } else {
      return res.status(400).json({ error: "Role inválido." });
    }

    if (!user) {
      return res.status(400).json({ error: "Token de redefinição de senha inválido ou expirado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await model.update({
      where: { email: user.email },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    

    res.json({ message: "Senha redefinida com sucesso." });

  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const resetPasswordWithoutToken = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e nova senha são obrigatórios." });
  }

  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    const model = prisma.usuario; 

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.update({ 
      where: { email: user.email },
      data: {
        password: hashedPassword,
      },
    });

    res.json({ message: "Senha redefinida com sucesso (teste sem token)." });

  } catch (error) {
    console.error("Erro ao redefinir senha (teste sem token):", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};