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
  const { name, sobrenome, email, password, cpf, telefone, atuacao, empresa, faculdade } = req.body;

  if (!name || !sobrenome || !email || !password || !cpf || !telefone) {
    return res.status(400).json({ error: "Campos obrigatórios (Nome, Sobrenome, Email, Senha, CPF, Telefone) não foram preenchidos." });
  }

  try {
 
    const emailExists = await prisma.usuario.findUnique({ where: { email } });
    if (emailExists) {
      return res.status(409).json({ error: "Usuário já existente, por favor realize o login" });
    }
    const cpfExists = await prisma.usuario.findUnique({ where: { cpf } });
    if (cpfExists) {
      return res.status(409).json({ error: "Dados de cadastro inválidos ou já existentes. Verifique as informações ou tente fazer login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.usuario.create({
      data: {
        name,
        sobrenome,
        email,
        cpf,
        telefone,
        atuacao,
        empresa,
        faculdade,
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

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).send('Usuário não encontrado');
    }

    const senhaCorreta = await bcrypt.compare(password, usuario.password);
    if (!senhaCorreta) {
      return res.status(401).send('Senha incorreta');
    }

    req.session.tipo = 'usuario';
    req.session.userId = usuario.id;

    res.redirect('/dataUser'); 
  } catch (error) {
    res.status(500).send('Erro ao fazer login');
  }
};

export const dataUser = async (req, res) => {
  console.log('Sessão atual:', req.session);
  try {
    let usuario = null;
    let isAdmin = false;

    if (req.session.tipo === 'admin' && req.session.adminId) {
      usuario = await prisma.admin.findUnique({
        where: { id: req.session.adminId }
      });
      isAdmin = true;
    } else if (req.session.tipo === 'usuario' && req.session.userId) {
      usuario = await prisma.usuario.findUnique({
        where: { id: req.session.userId }
      });
    }

    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.render('dados_usuario', { usuario, isAdmin });
  } catch (error) {
    res.status(500).send('Erro ao buscar dados do usuário');
  }
};