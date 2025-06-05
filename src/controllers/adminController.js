import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const createAdmin = async (req, res) => {
  const { name, sobrenome, email, password, cpf, telefone, atuacao, empresa, faculdade } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: { name, sobrenome, email, password: hashedPassword, cpf, telefone, atuacao, empresa, faculdade },
    });
    req.flash('success', 'Gestor cadastrado com sucesso!');
    res.json({ success: true, message: 'Gestor cadastrado com sucesso!' });
  } catch (error) {
    console.error("Error creating admin:", error);
    if (error.code === "P2002") {
      req.flash('error', 'E-mail já cadastrado!');
      res.redirect('/api/admin');
    } else {
      req.flash('error', 'Erro interno ao cadastrar Gestor.');
      res.redirect('/api/admin');
    }
  }
};

function parseCurrencyFromRequest(value) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const cleanedString = value
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.');
    const num = parseFloat(cleanedString);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export const createEvent = async (req, res) => {
  const adminIdFromToken = req.user.id;
  if (!adminIdFromToken) {
    req.flash(
      "error",
      "Não foi possível identificar o Gestor. Faça login novamente."
    );
    return res.redirect("/api/login");
  }

  const {
    name,
    description,
    eventDate,
    ticketDeadline,
    ticketPrice,
    status,
    maxTickets,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    cep
  } = req.body;

  if (
    !name ||
    !description ||
    !eventDate ||
    !ticketDeadline ||
    ticketPrice === undefined ||
    ticketPrice === null ||
    !status ||
    !maxTickets ||
    !street ||
    !number ||
    !neighborhood ||
    !city ||
    !state ||
    !cep
  ) {
    req.flash("error", "Todos os campos são obrigatórios e devem ser válidos.");
    return res.redirect(`/api/admin/events`);
  }

  try {
    const finalEventDate = new Date(eventDate);
    const finalTicketDeadline = new Date(ticketDeadline);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const eventDateForComparison = new Date(finalEventDate.getFullYear(), finalEventDate.getMonth(), finalEventDate.getDate());

    if (eventDateForComparison < now) {
      req.flash(
        "error",
        "A data do evento não pode ser anterior à data atual."
      );
      return res.redirect(`/api/admin/events`);
    }

    const numericTicketPrice = parseCurrencyFromRequest(ticketPrice);

    const newEvent = await prisma.event.create({
      data: {
        name,
        description,
        eventDate: finalEventDate,
        ticketDeadline: finalTicketDeadline,
        ticketPrice: numericTicketPrice,
        status,
        maxTickets: parseInt(maxTickets, 10),
        street,
        number: parseInt(number, 10),
        complement: complement || null,
        neighborhood,
        city,
        state,
        cep,
        admin: { connect: { id: adminIdFromToken } },
      },
    });

    req.flash("success", "Evento criado com sucesso!");
    res.redirect(`/api/admin/events`);
  } catch (error) {
    console.error("Error creating event:", error);
    req.flash(
      "error",
      "Erro ao criar o evento. Verifique os dados e tente novamente."
    );
    res.redirect(`/api/admin/events`);
  }
};

export const listEvents = async (req, res) => {
  const adminIdFromToken = req.user.id;
  if (!adminIdFromToken) {
    req.flash(
      "error",
      "Não foi possível identificar o Gestor. Faça login novamente."
    );
    return res.redirect("/api/login");
  }
  try {
    const events = await prisma.event.findMany({
      where: {
        adminId: adminIdFromToken,
      },
      orderBy: {
        eventDate: "desc",
      },
    });
    const messages = {
      success: req.flash("success"),
      error: req.flash("error"),
    };
    res.render("admin/adicionar_evento", {
      events: events,
      adminId: adminIdFromToken,
      messages: messages,
      user: req.user,
    });
  } catch (error) {
    req.flash("error", "Erro ao carregar a página de eventos.");
    console.error("Erro ao listar eventos:", error);
    res.status(500).send("Erro ao buscar a página de eventos.");
  }
};

export const updateEvent = async (req, res) => {
  const adminIdFromToken = req.user.id;
  const { eventId: eventIdParam } = req.params;
  const {
    name,
    description,
    eventDate,
    ticketDeadline,
    ticketPrice,
    status,
    maxTickets,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    cep
  } = req.body;

  const eventId = parseInt(eventIdParam, 10);

  if (!adminIdFromToken) {
    return res.status(401).json({ error: "Gestor não autenticado." });
  }
  if (isNaN(eventId)) {
    return res.status(400).json({ error: "ID do evento deve ser um número inteiro válido." });
  }

  if (
    !name || !description || !eventDate || !ticketDeadline || ticketPrice === undefined || ticketPrice === null || !status || !maxTickets ||
    !street || !number || !neighborhood || !city || !state || !cep
  ) {
    return res.status(400).json({
      error:
        "Todos os campos são obrigatórios para atualização. Verifique se a interface de edição está enviando todos os dados necessários.",
    });
  }

  const numericTicketPriceForUpdate = parseCurrencyFromRequest(ticketPrice);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado." });
    }

    if (event.adminId !== adminIdFromToken) {
      req.flash("error", "Você não tem permissão para editar este evento.");
      return res
        .status(403)
        .json({ error: "Você não tem permissão para editar este evento." });
    }

    const finalEventDateForUpdate = new Date(eventDate);
    const finalTicketDeadlineForUpdate = new Date(ticketDeadline);

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: name.trim(),
        description: description.trim(),
        eventDate: finalEventDateForUpdate,
        ticketDeadline: finalTicketDeadlineForUpdate,
        ticketPrice: numericTicketPriceForUpdate,
        status,
        maxTickets: parseInt(maxTickets, 10),
        street: street.trim(),
        number: parseInt(number.trim(), 10),
        complement: complement ? complement.trim() : null,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        cep: cep.trim(),
      },
    });

    req.flash("success", "Evento atualizado com sucesso!");
    res
      .status(200)
      .json({ message: "Evento atualizado com sucesso!", event: updatedEvent });
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    req.flash("error", "Erro interno ao atualizar o evento. Tente novamente.");
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Erro ao atualizar: Evento não encontrado na base de dados.",
      });
    }
    res
      .status(500)
      .json({ error: "Erro interno ao atualizar o evento. Tente novamente." });
  }
};

export const deleteEvent = async (req, res) => {
  const adminIdFromToken = req.user.id;
  const { eventId: eventIdParam } = req.params;
  const eventId = parseInt(eventIdParam, 10);

  if (!adminIdFromToken) {
    return res
      .status(401)
      .json({ error: "Administrador não autenticado.", success: false });
  }
  if (isNaN(eventId)) {
    req.flash("error", "ID do evento inválido.");
    return res
      .status(400)
      .json({ error: "ID do evento inválido.", success: false });
  }
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      req.flash("error", "Evento não encontrado.");
      return res
        .status(404)
        .json({ error: "Evento não encontrado.", success: false });
    }
    if (event.adminId !== adminIdFromToken) {
      req.flash(
        "error",
        "Evento não encontrado ou você não tem permissão para excluí-lo."
      );
      return res.status(403).json({
        error: "Você não tem permissão para excluir este evento.",
        success: false,
      });
    }
    await prisma.event.delete({
      where: { id: eventId },
    });
    req.flash("success", "Evento excluído com sucesso!");
    res.json({ message: "Event deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    req.flash("error", "Erro interno ao excluir o evento.");
    res.status(500).json({ error: "Internal server error", success: false });
  }
};
export const updateAdminProfile = async (req, res) => {
  const { adminId: adminIdFromParams } = req.params; // ID do admin vindo da URL
  const { name, email, sobrenome, password, currentPassword, cpf, telefone, atuacao, empresa, faculdade } = req.body;
  const loggedInAdminId = req.user?.id; // ID do admin logado (do token/sessão)

  if (!loggedInAdminId) {
    req.flash("error", "Administrador não autenticado.");
    return res.status(401).redirect('/api/login');
  }

  if (parseInt(adminIdFromParams, 10) !== loggedInAdminId) {
    req.flash("error", "Acesso negado. Você só pode editar seu próprio perfil.");
    return res.status(403).redirect('/api/dataUser');
  }

  if (!name && !email && !sobrenome && !password && !cpf && !telefone && !atuacao && !empresa && !faculdade) {
    req.flash("error", "Informe ao menos um campo para atualização.");
    return res.status(400).redirect('/api/dataUser');
  }

  try {
    const adminToUpdate = await prisma.admin.findUnique({
      where: { id: loggedInAdminId },
    });

    if (!adminToUpdate) {
      req.flash("error", "Administrador não encontrado.");
      return res.status(404).redirect('/api/dataUser');
    }

    const dataForPrismaUpdate = {};
    if (name !== undefined) dataForPrismaUpdate.name = name;
    if (sobrenome !== undefined) dataForPrismaUpdate.sobrenome = sobrenome;
    if (email !== undefined) dataForPrismaUpdate.email = email;
    if (cpf !== undefined && cpf !== null) dataForPrismaUpdate.cpf = String(cpf).replace(/\D/g, '');
    if (telefone !== undefined && telefone !== null) dataForPrismaUpdate.telefone = String(telefone).replace(/\D/g, '');
    if (atuacao !== undefined) dataForPrismaUpdate.atuacao = atuacao;
    if (empresa !== undefined) dataForPrismaUpdate.empresa = empresa;
    if (faculdade !== undefined) dataForPrismaUpdate.faculdade = faculdade;

    if (password && password.trim() !== "") {
      if (!currentPassword) {
        req.flash("error", "Senha atual é obrigatória para definir uma nova senha.");
        return res.status(400).redirect('/api/dataUser');
      }
      const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, adminToUpdate.password);
      if (!isCurrentPasswordCorrect) {
        req.flash("error", "Senha atual incorreta.");
        return res.status(400).redirect('/api/dataUser');
      }
      dataForPrismaUpdate.password = await bcrypt.hash(password, 10);
    }

    await prisma.admin.update({
      where: { id: loggedInAdminId },
      data: dataForPrismaUpdate,
    });

    req.session.showEditMessage = true;
    req.flash("success", "Dados do administrador atualizados com sucesso!");
    res.redirect("/api/dataUser");

  } catch (error) {
    console.error("Erro ao atualizar perfil do administrador:", error);
    if (error.code === 'P2002') { // Falha na restrição de unicidade (ex: e-mail ou CPF já em uso)
      const target = error.meta && error.meta.target ? error.meta.target.join(', ') : "campo";
      req.flash("error", `Erro ao atualizar: ${target} já está em uso por outro administrador.`);
    } else {
      req.flash("error", "Erro interno ao atualizar perfil do administrador.");
    }
    res.status(500).redirect("/api/dataUser");
  }
};