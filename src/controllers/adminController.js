import { PrismaClient } from "../../generated/prisma/index.js";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const createAdmin = async (req, res) => {
  const { name, sobrenome, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: { name, sobrenome, email, password: hashedPassword },
    });
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: "Email already in use" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const createEvent = async (req, res) => {
  const adminIdFromToken = req.user.id;
  if (!adminIdFromToken) {
    req.flash('error', 'Não foi possível identificar o administrador. Faça login novamente.');
    return res.redirect('/api/login');
  }
  const { name, description, eventDate, ticketDeadline, ticketPrice, status } = req.body;
  try {
    const parsedEventDate = new Date(eventDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    parsedEventDate.setHours(0, 0, 0, 0);

    if (parsedEventDate < now) {
      req.flash('error', 'A data do evento não pode ser anterior à data atual.');
      return res.redirect(`/api/admin/events`);
    }
    if (!name || !description || !eventDate || !ticketDeadline || ticketPrice === undefined || ticketPrice === null || !status) {
      req.flash('error', 'Todos os campos são obrigatórios e devem ser válidos.');
      return res.redirect(`/api/admin/events`);
    }

    const newEvent = await prisma.event.create({
      data: {
        name,
        description,
        eventDate: parsedEventDate,
        ticketDeadline: new Date(ticketDeadline),
        ticketPrice: parseFloat(ticketPrice),
        status,
        admin: { connect: { id: adminIdFromToken } },
      },
    });
    req.flash('success', 'Evento criado com sucesso!');
    res.redirect(`/api/admin/events`);
  } catch (error) {
    console.error("Error creating event:", error);
    req.flash('error', 'Erro ao criar o evento. Verifique os dados e tente novamente.');
    res.redirect(`/api/admin/events`);
  }
};

export const listEvents = async (req, res) => {
  const adminIdFromToken = req.user.id;
  if (!adminIdFromToken) {
    req.flash('error', 'Não foi possível identificar o administrador. Faça login novamente.');
    return res.redirect('/api/login');
  }
  try {
    const events = await prisma.event.findMany({
      where: {
        adminId: adminIdFromToken,
      },
      orderBy: {
        eventDate: 'desc',
      },
    });
    const messages = {
      success: req.flash('success'),
      error: req.flash('error')
    };
    res.render("admin/adicionar_evento", {
      events: events,
      adminId: adminIdFromToken,
      messages: messages,
      user: req.user
    });
  } catch (error) {
    req.flash('error', 'Erro ao carregar a página de eventos.');
    console.error("Erro ao listar eventos:", error);
    res.status(500).send("Erro ao buscar a página de eventos.");
  }
};

export const updateEvent = async (req, res) => {
  const adminIdFromToken = req.user.id;
  const { eventId: eventIdParam } = req.params;
  const { name, description, eventDate, ticketDeadline, ticketPrice, status } = req.body;

  const eventId = parseInt(eventIdParam);

   if (!adminIdFromToken) {
    return res.status(401).json({ error: 'Administrador não autenticado.' });
  }
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'IDs de administrador e evento devem ser números inteiros válidos.' });
  }

  try {
    const event = await prisma.Event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    if (event.adminId !== adminIdFromToken) {
      req.flash('error', 'Você não tem permissão para editar este evento.');
      return res.status(403).json({ error: 'Você não tem permissão para editar este evento.' });
    }

    const updatedEvent = await prisma.Event.update({
      where: { id: eventId },
      data: {
        name: name.trim(),
        description: description.trim(),
        eventDate: new Date(eventDate),
        ticketDeadline: new Date(ticketDeadline),
        ticketPrice: parseFloat(ticketPrice),
        status,
      },
    });
    
    req.flash('success', 'Evento atualizado com sucesso!');
    res.status(200).json({ message: 'Evento atualizado com sucesso!', event: updatedEvent });
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    req.flash('error', 'Erro interno ao atualizar o evento. Tente novamente.');
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Erro ao atualizar: Evento não encontrado na base de dados.' });
    }
    res.status(500).json({ error: 'Erro interno ao atualizar o evento. Tente novamente.' });
  }
};


export const deleteEvent = async (req, res) => {
  const adminIdFromToken = req.user.id;
  const { eventId: eventIdParam } = req.params;
  const eventId = parseInt(eventIdParam);

  if (!adminIdFromToken) {
    return res.status(401).json({ error: 'Administrador não autenticado.', success: false });
  }
  if (isNaN(eventId)) {
    req.flash('error', 'ID do evento inválido.');
    return res.status(400).json({ error: "ID do evento inválido.", success: false });
  }
  try {
    const event = await prisma.Event.findUnique({
      where: { id: parseInt(eventId) },
    });
    if (!event) {
      req.flash('error', 'Evento não encontrado.');
      return res.status(404).json({ error: "Evento não encontrado.", success: false });
    }
    if (event.adminId !== adminIdFromToken) {
      req.flash('error', 'Evento não encontrado ou você não tem permissão para excluí-lo.');
      return res.status(403).json({ error: "Você não tem permissão para excluir este evento.", success: false });
    }
    await prisma.event.delete({
      where: { id: eventId },
    });
    req.flash('success', 'Evento excluído com sucesso!');
    res.json({ message: "Event deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    req.flash('error', 'Erro interno ao excluir o evento.');
    res.status(500).json({ error: "Internal server error", success: false });
  }
};