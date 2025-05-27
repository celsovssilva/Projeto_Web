import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", 
  port: 2525,                      
  auth: {
    user: "22792d5882d4d2", 
    pass: "007c2247df9903"       
  }
});




 
export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email e role são obrigatórios." });
  }

  try {
    let user;
    if (role === "user") {
      user = await prisma.usuario.findUnique({ where: { email } });
    } else if (role === "admin") {
      user = await prisma.Admin.findUnique({ where: { email } });
    } else {
      return res.status(400).json({ error: "Role inválido." });
    }

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

   
    const resetToken = jwt.sign(
      { userId: user.id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `http://seuprojeto.com/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: 'seuemail@seudominio.com',
      to: user.email,
      subject: 'Link para Redefinição de Senha',
      html: `<p>Você solicitou a redefinição da sua senha. Clique no link abaixo para continuar:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>Este link é válido por uma hora.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Um link para redefinir sua senha foi enviado para o seu email." });

  } catch (error) {
    console.error("Erro ao solicitar reset de senha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, role } = decoded;

    let model;
    if (role === "user") {
      model = prisma.usuario;
    } else if (role === "admin") {
      model = prisma.Admin;
    } else {
      return res.status(400).json({ error: "Role inválido." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await model.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: "Senha redefinida com sucesso." });

  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token expirado." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Token inválido." });
    }
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

