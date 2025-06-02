import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Por favor, informe seu e-mail e o tipo de conta (usuário ou administrador)." });
  }

  try {
    let user;
    if (role === "user") {
      user = await prisma.usuario.findUnique({ where: { email } });
    } else if (role === "admin") {
      user = await prisma.admin.findUnique({ where: { email } });
    } else {
      return res.status(400).json({ error: "Tipo de conta inválido." });
    }

    // Sempre retorna a mesma mensagem, mesmo se o usuário não existir
    if (!user) {
      // Simula um tempo de resposta semelhante ao caso de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.json({ message: "Enviamos um link para redefinir sua senha para o seu e-mail." });
    }

    // Salva a data/hora do pedido de redefinição
    const now = new Date();
    if (role === "user") {
      await prisma.usuario.update({
        where: { id: user.id },
        data: { resetPasswordRequestedAt: now }
      });
    } else if (role === "admin") {
      await prisma.admin.update({
        where: { id: user.id },
        data: { resetPasswordRequestedAt: now }
      });
    }

    // Inclui a data no token
    const resetToken = jwt.sign(
      { userId: user.id, role, requestedAt: now },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.APP_URL}/api/reset-password?token=${resetToken}`;

    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_TEMPLATE_ID ||
      !process.env.EMAILJS_PUBLIC_KEY ||
      !process.env.EMAILJS_PRIVATE_KEY
    ) {
      console.error("Erro: Variáveis de ambiente do EmailJS não configuradas corretamente.");
      return res.status(500).json({ error: "Houve um problema na configuração do envio de e-mail." });
    }

    const emailJsPayload = {
      service_id: String(process.env.EMAILJS_SERVICE_ID),
      template_id: String(process.env.EMAILJS_TEMPLATE_ID),
      user_id: String(process.env.EMAILJS_PUBLIC_KEY),
      accessToken: String(process.env.EMAILJS_PRIVATE_KEY),
      template_params: {
        email: user.email,
        link: resetLink,
      }
    };

    const emailJsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailJsPayload)
    });

    // Sempre retorna a mesma mensagem, mesmo se o envio falhar
    res.json({ message: "Enviamos um link para redefinir sua senha para o seu e-mail." });

  } catch (error) {
    // Loga o erro, mas retorna mensagem genérica para o usuário
    console.error("Erro inesperado ao processar a solicitação de redefinição de senha:", error);
    res.json({ message: "Enviamos um link para redefinir sua senha para o seu e-mail." });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Por favor, forneça o token de redefinição e a nova senha." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, role, requestedAt } = decoded;

    let user;
    let model;
    if (role === "user") {
      user = await prisma.usuario.findUnique({ where: { id: userId } });
      model = prisma.usuario;
    } else if (role === "admin") {
      user = await prisma.admin.findUnique({ where: { id: userId } });
      model = prisma.admin;
    } else {
      return res.status(400).json({ error: "Tipo de conta inválido no token." });
    }

    // Verifica se o token é o mais recente
    if (
      !user.resetPasswordRequestedAt ||
      new Date(requestedAt).getTime() !== new Date(user.resetPasswordRequestedAt).getTime()
    ) {
      return res.status(400).json({ error: "Este link de redefinição já foi utilizado ou não é mais válido." });
    }

    // Validação de força de senha (opcional)
    if (password.length < 8) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 8 caracteres." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualiza a senha e zera o campo de controle
    await model.update({
      where: { id: userId },
      data: { password: hashedPassword, resetPasswordRequestedAt: null }
    });

    res.json({ message: "Sua senha foi redefinida com sucesso. Redirecionando..." });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Este link de redefinição expirou." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Este token de redefinição é inválido." });
    }
    res.status(500).json({ error: "Ocorreu um erro interno ao tentar redefinir sua senha." });
  }
};