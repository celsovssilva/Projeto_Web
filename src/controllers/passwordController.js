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

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado com este e-mail." });
    }

    const resetToken = jwt.sign(
      { userId: user.id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

   
    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
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

    if (emailJsResponse.ok) {
      res.json({ message: "Enviamos um link para redefinir sua senha para o seu e-mail." });
    } else {
      const responseText = await emailJsResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (jsonError) {
        errorData = responseText;
      }
      console.error(`Erro ao enviar e-mail de redefinição (Status: ${emailJsResponse.status}):`, errorData);
      res.status(emailJsResponse.status).json({ error: "Houve uma falha ao enviar o e-mail de redefinição de senha." });
    }

  } catch (error) {
    console.error("Erro inesperado ao processar a solicitação de redefinição de senha:", error);
    console.error("Detalhes do erro:", error.message);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor." });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Por favor, forneça o token de redefinição e a nova senha." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, role } = decoded;

    let model;
    if (role === "user") {
      model = prisma.usuario;
    } else if (role === "admin") {
      model = prisma.admin;
    } else {
      return res.status(400).json({ error: "Tipo de conta inválido no token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await model.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: "Sua senha foi redefinida com sucesso." });

  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    console.error("Detalhes do erro:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Este link de redefinição expirou." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Este token de redefinição é inválido." });
    }
    res.status(500).json({ error: "Ocorreu um erro interno ao tentar redefinir sua senha." });
  }
};
