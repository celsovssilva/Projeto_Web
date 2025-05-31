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