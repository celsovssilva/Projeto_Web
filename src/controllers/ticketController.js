// src/controllers/ticketController.js
import { PrismaClient } from "../../generated/prisma/index.js";
import qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const purchaseTicket = async (req, res) => {
  const { eventId } = req.params;

  const userId = req.session.user?.id;

  if (isNaN(parseInt(eventId, 10))) {
    return res.status(400).json({ error: "ID do evento inválido." });
  }

  try {
    const event = await prisma.Event.findUnique({
      where: { id: parseInt(eventId, 10) },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado." });
    }
    if (event.status !== 'ACTIVE') {
      return res.status(400).json({ error: "Este evento não está ativo para compra de ingressos." });
    }

    const now = new Date();
    const hojeSemHoras = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const ticketDeadlineObj = new Date(event.ticketDeadline);
    const ticketDeadlineApenasData = new Date(ticketDeadlineObj.getFullYear(), ticketDeadlineObj.getMonth(), ticketDeadlineObj.getDate());

    if (ticketDeadlineApenasData < hojeSemHoras) {
      return res.status(400).json({ error: "O prazo para compra de ingressos para este evento já encerrou." });
    }

    if (event.maxTickets !== null && event.maxTickets > 0 && event.ticketsSold >= event.maxTickets) {
      return res.status(400).json({ error: "Ingressos esgotados para este evento." });
    }

    const qrIdentifier = uuidv4();

    const result = await prisma.$transaction(async (tx) => {
        const ticketData = {
          qrCodeString: qrIdentifier, 
          event: { connect: { id: parseInt(eventId, 10) } },
          isValid: true, 
        };
        if (userId) { 
          ticketData.usuario = { connect: { id: userId } };
        }

        const newTicket = await tx.Ticket.create({ data: ticketData });

        const updatedEvent = await tx.Event.update({
            where: { id: parseInt(eventId, 10) },
            data: { ticketsSold: { increment: 1 } },
        });
        
        if (updatedEvent.maxTickets !== null && updatedEvent.maxTickets > 0 && updatedEvent.ticketsSold > updatedEvent.maxTickets) {
            throw new Error("CONCURRENCY_ERROR_TICKETS_SOLD_OUT");
        }
        return { newTicket, updatedEvent };
    });

    const appBaseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const qrCodeContentForCheckin = `${appBaseUrl}/api/checkin-manual?ticketId=${result.newTicket.id}&qrString=${qrIdentifier}`;
    const qrCodeDataURL = await qrcode.toDataURL(qrCodeContentForCheckin);

    res.status(201).json({
      message: "Ingresso adquirido e pagamento simulado confirmado!",
      ticket: { 
        id: result.newTicket.id,
        eventId: result.newTicket.eventId,
        userId: result.newTicket.userId, 
        createdAt: result.newTicket.createdAt
      },
      eventDetails: { 
        name: event.name,
        date: event.eventDate,
        location: event.endereco
      },
      qrCodeDataURL: qrCodeDataURL, 
    });

  } catch (error) {
    console.error("Erro ao adquirir ingresso:", error);
    if (error.message === "CONCURRENCY_ERROR_TICKETS_SOLD_OUT") {
        return res.status(409).json({ error: "Ingressos esgotados devido à alta demanda no momento da sua compra." });
    }
    res.status(500).json({ error: "Erro interno do servidor ao adquirir ingresso." });
  }
};