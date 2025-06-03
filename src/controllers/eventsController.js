import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const listEventsForUser = async (req, res) => {
    try {
        const agora = new Date();

        const todosOsEventos = await prisma.event.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                eventDate: true,
                ticketDeadline: true,
                street: true,
                number: true,
                neighborhood: true,
                city: true,
                state: true,
                cep: true,
                ticketPrice: true,
                maxTickets: true,
                status: true
            },
            orderBy: {
                eventDate: 'asc',
            },
        });

        const eventosCategorizados = {
            novos: [],
            disponiveis: [],
            encerrados: []
        };

        todosOsEventos.forEach(evento => {
            const dataEventoObj = new Date(evento.eventDate);
            const prazoIngressoObj = new Date(evento.ticketDeadline);
            const eventoFuturo = dataEventoObj > agora;
            const prazoAberto = prazoIngressoObj >= agora;
            const eventoEncerrado = evento.status === "CLOSED" || !prazoAberto;

            if (eventoEncerrado) {
                eventosCategorizados.encerrados.push(evento);
            } else if (eventoFuturo) {
                eventosCategorizados.novos.push(evento);
            } else if (!eventoFuturo && prazoAberto && dataEventoObj <= agora) {
                eventosCategorizados.disponiveis.push(evento);
            }
        });

        res.render('events', { eventos: eventosCategorizados });

    } catch (error) {
        console.error("Erro ao listar eventos para o usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar eventos.", error: error.message });
    }
};
export const getEventById = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        if (isNaN(eventId)) {
            return res.status(400).json({ message: "ID inválido." });
        }

        const evento = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!evento) {
            return res.status(404).json({ message: "Evento não encontrado." });
        }

        res.json(evento);
    } catch (error) {
        console.error("Erro ao buscar evento:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};