import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', "Email e senha são obrigatórios.");
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    let user;
    let userType;

    user = await prisma.admin.findUnique({ where: { email } });
    userType = "admin";
    if (!user) {
      user = await prisma.usuario.findUnique({ where: { email } });
      userType = "usuario";
    }

    if (!user) {
      req.flash('error', "E-mail ou senha incorretos.");
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      req.flash('error', "E-mail ou senha incorretos.");
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      type: userType
    };
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
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        type: userType
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    req.flash('error', "Erro interno do servidor. Tente novamente mais tarde.");
    return res.status(500).json({ message: "Erro interno do servidor. Tente novamente mais tarde." });
  }
};