import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const listEventsForUser = async (req, res) => {
    try {
        const agora = new Date();

        const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todosOsEventos = await prisma.event.findMany({
            orderBy: {
                eventDate: 'asc',
            },
        });

        const eventosCategorizados = {
            novos: [],
            disponiveis: [],
            fechados: []
        };

        todosOsEventos.forEach(evento => {
            const dataEventoObj = new Date(evento.eventDate);
            const prazoIngressoObj = new Date(evento.ticketDeadline);
            const dataCriacaoObj = new Date(evento.createdAt);


            const estaFechado = evento.status === "CLOSED" ||
                                dataEventoObj < agora ||
                                prazoIngressoObj < agora;

            const estaAtivoEAberto = evento.status === "ACTIVE" &&
                                     prazoIngressoObj >= agora &&
                                     dataEventoObj >= agora;


            const ehNovo = estaAtivoEAberto && dataCriacaoObj >= seteDiasAtras;

            if (estaFechado) {
                eventosCategorizados.fechados.push(evento);
            } else if (ehNovo) {

                eventosCategorizados.novos.push(evento);
            } else if (estaAtivoEAberto) {

                eventosCategorizados.disponiveis.push(evento);
            }
        });

        res.json(eventosCategorizados);

    } catch (error) {
        console.error("Erro ao listar eventos para o usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar eventos.", error: error.message });
    }
};