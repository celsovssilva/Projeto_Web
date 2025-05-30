import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany();
    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(userId, 10) },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createUser = async (req, res) => {
  const { name, sobrenome, email, password } = req.body;

  if (!name || !sobrenome || !email || !password) {
    return res.status(400).json({ error: "Este Usuário já está cadastrado. Por favor, faça login para continuar." });
  }

  try {
 
    const userExists = await prisma.usuario.findUnique({ where: { email } });
    if (userExists) {
      return res.status(409).json({ error: "Usuário já existente, por favor realize o login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.usuario.create({
      data: {
        name,
        sobrenome,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};


export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await prisma.usuario.delete({
      where: { id: parseInt(userId, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, sobrenome, password } = req.body;

  if (!name && !email && !sobrenome && !password) {
    return res.status(400).json({ error: "Informe ao menos um campo para atualização" });
  }

  try {
    let data = { name, email, sobrenome };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: parseInt(userId, 10) },
      data,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
