import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import validator from 'validator'; // Adicionado para validação de e-mail

dotenv.config();
const prisma = new PrismaClient();

// Configuração do transporter de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io", // Fallback para Mailtrap se não definido
  port: parseInt(process.env.EMAIL_PORT || "2525", 10), // Convertido para número, com fallback
  secure: process.env.EMAIL_SECURE === 'true' || false, // `secure: true` para port 465, false para outros como 587 ou 2525 (STARTTLS)
                                                        // Mailtrap geralmente usa `secure: false` para STARTTLS na porta 2525 ou 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * @function forgotPassword
 * Solicita a redefinição de senha.
 */
export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email e tipo (role) são obrigatórios." });
  }

  // SUGESTÃO: Validação do formato do e-mail
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Formato de e-mail inválido." });
  }

  const normalizedEmail = email.toLowerCase();
  let user;
  let userModel;
  let userRoleType = role.toLowerCase();

  try {
    if (userRoleType === "user" || userRoleType === "usuario") {
      userModel = prisma.Usuario;
      userRoleType = "user"; // Padronizar para o token
    } else if (userRoleType === "admin") {
      userModel = prisma.Admin; // CORRIGIDO: Admin com 'A' maiúsculo
    } else {
      return res.status(400).json({ error: "Tipo (role) inválido. Use 'user' ou 'admin'." });
    }

    user = await userModel.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Consideração de segurança: Para não revelar se um e-mail está cadastrado,
      // muitos sistemas retornam uma mensagem genérica de sucesso aqui.
      // Mantendo a lógica da equipe por enquanto:
      console.warn(`Solicitação de reset para e-mail não encontrado/role incorreto: ${email} (${role})`);
      // Para o usuário final, é melhor não indicar se o e-mail existe ou não.
      // A mensagem de sucesso abaixo cobre isso, mesmo que o usuário não seja encontrado.
      // No entanto, o return res.status(404) original da equipe era mais direto para debug.
      // Se for para produção, a mensagem genérica é mais segura:
      return res.json({ message: "Se uma conta com este e-mail e tipo existir, um link para redefinir a senha foi enviado." });
      // return res.status(404).json({ error: "Usuário não encontrado com este e-mail e tipo." }); // Versão original da equipe
    }

    const resetToken = jwt.sign(
      { userId: user.id, role: userRoleType, email: user.email }, // Adicionar email ao token pode ser útil para verificação extra
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expira em 1 hora
    );

    // A rota /api/reset-password deve renderizar a página EJS que contém o formulário para a nova senha
    const resetLink = `${req.protocol}://${req.get('host')}/api/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Entrada Express" <${process.env.EMAIL_USER}>`, // Usar um EMAIL_FROM dedicado ou formatar
      to: user.email,
      subject: 'Link para Redefinição de Senha - Entrada Express',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Redefinição de Senha</h2>
          <p>Olá ${user.name || ''},</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema Entrada Express.</p>
          <p>Por favor, clique no link abaixo para criar uma nova senha. Este link é válido por <strong>1 hora</strong>:</p>
          <p><a href="${resetLink}" style="color: #007bff; text-decoration: none;">Redefinir Minha Senha</a></p>
          <p>Se o botão não funcionar, copie e cole o seguinte URL no seu navegador:</p>
          <p><a href="${resetLink}" style="color: #333;">${resetLink}</a></p>
          <p>Se você não solicitou esta alteração, nenhuma ação é necessária e sua senha permanecerá a mesma.</p>
          <hr>
          <p>Atenciosamente,<br>Equipe Entrada Express</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Um link para redefinir sua senha foi enviado para o seu e-mail." });

  } catch (error) {
    console.error("Erro ao solicitar reset de senha:", error);
    console.error("Detalhes do erro:", error.message); // Mantido da versão da equipe
    res.status(500).json({ error: "Erro interno do servidor ao processar sua solicitação." });
  }
};

/**
 * @function resetPassword
 * Redefine a senha do usuário usando o token.
 */
export const resetPassword = async (req, res) => {
  const token = req.body.token || req.query.token; // Pega token do corpo ou da query
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
  }

  // SUGESTÃO: Validação de força da nova senha
  if (password.length < 8) {
    return res.status(400).json({ error: "A nova senha deve ter no mínimo 8 caracteres." });
  }
  // Adicione mais regras de complexidade para a senha aqui, se desejar

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, role, email: tokenEmail } = decoded; // Adicionado email para verificação

    let userModel;
    let userToUpdate;

    if (role === "user") {
      userModel = prisma.Usuario;
    } else if (role === "admin") {
      userModel = prisma.Admin; // CORRIGIDO: Admin com 'A' maiúsculo
    } else {
      return res.status(400).json({ error: "Tipo (role) inválido no token." });
    }

    userToUpdate = await userModel.findUnique({ where: { id: userId }});
    
    // Verificação opcional mas recomendada: o usuário ainda existe e o email no token corresponde?
    if (!userToUpdate || userToUpdate.email !== tokenEmail) {
        return res.status(400).json({ error: "Token inválido ou usuário não corresponde mais aos dados do token." });
    }
    // Opcional: Verificar se o token já foi usado ou invalidado (se você armazenar o token no DB)

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        // Opcional: Limpar os campos de token de reset no banco de dados após o uso bem-sucedido
        // passwordResetToken: null,
        // passwordResetExpires: null 
      }
    });

    // Para uma API, a resposta JSON é boa. Se fosse uma página renderizada, um redirect para login seria melhor.
    res.json({ message: "Senha redefinida com sucesso. Você já pode fazer o login com sua nova senha." });

  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    console.error("Detalhes do erro:", error.message); // Mantido da versão da equipe
    let errorMessage = "Erro interno do servidor ao redefinir sua senha.";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expirado. Por favor, solicite um novo link de redefinição.";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Token inválido ou malformado. Por favor, verifique o link ou solicite um novo.";
    }
    res.status(400).json({ error: errorMessage }); // Usar 400 para erros de token
  }
};