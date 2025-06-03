import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    req.flash('error', "Email, senha e tipo (role) são obrigatórios.");
    return res.status(400).send();
  }

  try {
    let user;
    let userType;

    if (role === "user") {
      user = await prisma.usuario.findUnique({ where: { email } });
      userType = "usuario";
    } else if (role === "admin") {
      user = await prisma.admin.findUnique({ where: { email } });
      userType = "admin";
    } else {
      req.flash('error', "Tipo (role) inválido. Use 'user' ou 'admin'.");
      return res.status(400).send();
    }

    if (!user) {
      req.flash('error', "E-mail ou senha incorretos.");
      return res.status(401).send();
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      req.flash('error', "E-mail ou senha incorretos.");
      return res.status(401).send();
    }


    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

   req.session.tipo = userType;
    if (userType === "admin") {
      req.session.adminId = user.id;
    } else {
      req.session.userId = user.id;
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login bem-sucedido",
      token: token,
      user: { id: userWithoutPassword.id, email: userWithoutPassword.email, name: userWithoutPassword.name, type: userType }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    req.flash('error', "Erro interno do servidor. Tente novamente mais tarde.");
    return res.status(500).send();
  }
};
