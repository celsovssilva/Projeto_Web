// src/controllers/eventsController.js
import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const listEventsForUser = async (req, res) => {
  try {
    const agora = new Date();
    // Define 'hojeSemHoras' para comparações de data ignorando o horário atual.
    // Isso garante que um evento de hoje às 18h ainda é considerado "hoje" mesmo que 'agora' seja 10h.
    const hojeSemHoras = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    const todosOsEventos = await prisma.Event.findMany({ // CORRIGIDO: Event com 'E' maiúsculo
      orderBy: {
        eventDate: 'asc', // Ordenar por data do evento (os mais próximos primeiro)
      },
    });

    const eventosCategorizados = {
      novos: [],
      disponiveis: [],
      encerrados: []
    };

    const dataDaquiSeteDias = new Date(hojeSemHoras);
    dataDaquiSeteDias.setDate(hojeSemHoras.getDate() + 7); // Define o limite para "novos" eventos

    todosOsEventos.forEach(evento => {
      // Normaliza as datas do evento e do prazo do ingresso para o início do dia para comparações consistentes
      const dataEventoApenasData = new Date(new Date(evento.eventDate).getFullYear(), new Date(evento.eventDate).getMonth(), new Date(evento.eventDate).getDate());
      const prazoIngressoApenasData = new Date(new Date(evento.ticketDeadline).getFullYear(), new Date(evento.ticketDeadline).getMonth(), new Date(evento.ticketDeadline).getDate());

      let classificadoComoEncerrado = false;

      // Critérios para ser classificado como ENCERRADO:
      if (evento.status === "CLOSED" ||                                      // 1. Status explícito "CLOSED"
          dataEventoApenasData < hojeSemHoras ||                              // 2. Data do evento já passou completamente
          (prazoIngressoApenasData < hojeSemHoras && dataEventoApenasData >= hojeSemHoras) // 3. Evento é hoje/futuro, mas prazo de ingresso já passou
         ) {
        eventosCategorizados.encerrados.push(evento);
        classificadoComoEncerrado = true;
      }

      if (!classificadoComoEncerrado && evento.status === "ACTIVE") {
        // Se chegou aqui, o evento está ATIVO, a data do evento é hoje ou no futuro,
        // e o prazo de compra de ingressos também é hoje ou no futuro.

        // Critério para "Novos": Eventos ATIVOS que são estritamente no futuro (não hoje),
        // ocorrem nos próximos 7 dias, e têm prazo de ingresso válido.
        if (dataEventoApenasData > hojeSemHoras && dataEventoApenasData <= dataDaquiSeteDias) {
          eventosCategorizados.novos.push(evento);
        }
        // Critério para "Disponíveis": Eventos ATIVOS que são hoje OU futuros 
        // (e não foram classificados como "novos" se você quiser exclusividade, ou todos os disponíveis se "novos" for apenas um destaque).
        // Para listas distintas nas seções do EJS, vamos garantir que "disponíveis" pegue os que não são "novos".
        else if (dataEventoApenasData >= hojeSemHoras) { 
          // Se não é "novo" (ou seja, é hoje, ou é futuro > 7 dias), mas está disponível
          eventosCategorizados.disponiveis.push(evento);
        }
      }
    });

    // CORRIGIDO: Usar 'eventos' para corresponder ao nome do arquivo eventos.ejs
    // As variáveis currentUser, success_msg, error_msg já são globais devido ao middleware em index.js
    res.render('eventos', { 
        eventos: eventosCategorizados
    });

  } catch (error) {
    console.error("Erro ao listar eventos para o usuário:", error);
    // CORRIGIDO: Renderiza a página de eventos com uma mensagem de erro
    res.status(500).render('eventos', { // Usar 'eventos' aqui também
        eventos: { novos: [], disponiveis: [], encerrados: [] }, // Estrutura vazia para o template não quebrar
        errorMsg: "Desculpe, não foi possível carregar os eventos no momento. Tente novamente mais tarde."
        // currentUser, success_msg, error_msg também estarão disponíveis globalmente aqui se configurados
    });
  }
};