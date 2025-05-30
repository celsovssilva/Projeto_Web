import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const listEventsForUser = async (req, res) => {
    try {
        const agora = new Date();

        const todosOsEventos = await prisma.event.findMany({
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

            const eventoFuturo = dataEventoObj > agora; // Evento que ainda vai acontecer
            const prazoAberto = prazoIngressoObj >= agora; // Ingressos ainda disponíveis
            const eventoEncerrado = evento.status === "CLOSED" || !prazoAberto;

            if (eventoEncerrado) {
                eventosCategorizados.encerrados.push(evento);
            } else if (eventoFuturo && prazoAberto) {
                // Novo: evento no futuro com ingressos ainda abertos
                eventosCategorizados.novos.push(evento);
            } else if (!eventoFuturo && prazoAberto) {
                // Disponível: evento em andamento ou já passou, mas com ingressos ainda abertos
                eventosCategorizados.disponiveis.push(evento);
            }
            // Eventos passados e com prazo fechado já são tratados como encerrados acima
        });

        res.render('events', { eventos: eventosCategorizados });

    } catch (error) {
        console.error("Erro ao listar eventos para o usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar eventos.", error: error.message });
    }
};
