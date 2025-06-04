import { PrismaClient } from "../../generated/prisma/index.js";
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware de autenticação JWT
export const authenticateToken = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido ou sessão inválida. Acesso não autorizado.' });
  }
  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      if (req.session) req.session.destroy();
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado. Faça login novamente.' });
      }
      return res.status(403).json({ message: 'Token inválido.' });
    }
    req.user = decodedUser;
    next();
  });
};

// Listar eventos para o usuário
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
        ticketsSold: true,
        status: true
      },
      orderBy: {
        eventDate: 'asc',
      },
    });

    const eventosCategorizados = {
      novos: [],
      disponiveis: [],
      esgotados: [],
      encerrados: []
    };

    todosOsEventos.forEach(evento => {
      const dataEventoObj = new Date(evento.eventDate);
      const prazoIngressoObj = new Date(evento.ticketDeadline);
      const eventoFuturo = dataEventoObj > agora;
      const prazoAberto = prazoIngressoObj >= agora;
      const esgotado = evento.ticketsSold >= evento.maxTickets;
      const eventoEncerrado = evento.status === "CLOSED" || !prazoAberto;

      if (esgotado) {
        eventosCategorizados.esgotados.push(evento);
      } else if (eventoEncerrado) {
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

// Buscar evento por ID
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

export const comprarEvento = async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!eventId) {
      return res.status(400).json({ sucesso: false, message: 'Evento não informado.' });
    }
    const evento = await prisma.event.findUnique({ where: { id: Number(eventId) } });
    if (!evento) {
      return res.status(404).json({ sucesso: false, message: 'Evento não encontrado.' });
    }
    if (!req.user || !req.user.email) {
      return res.status(401).json({ sucesso: false, message: 'Usuário não autenticado.' });
    }

    // Verifica se ainda há ingressos disponíveis
    if (evento.ticketsSold >= evento.maxTickets) {
      return res.status(400).json({ sucesso: false, message: 'Ingressos esgotados para este evento.' });
    }

    try {
      // Primeiro realiza a compra
      await prisma.event.update({
        where: { id: Number(eventId) },
        data: { ticketsSold: { increment: 1 } }
      });

      // Tenta enviar o e-mail
      let emailStatus = {
        enviado: false,
        erro: null
      };

      try {
        const userEmail = req.user.email;
        const emailJsPayload = {
          service_id: String(process.env.EMAILJS_SERVICE_ID),
          template_id: String(process.env.EMAILJS_TEMPLATE_COMPRA),
          user_id: String(process.env.EMAILJS_PUBLIC_KEY),
          accessToken: String(process.env.EMAILJS_PRIVATE_KEY),
          template_params: {
            email: userEmail,
            message: `Olá! Sua compra para o evento "${evento.name}" foi confirmada.`,
            nome: evento.name,
            preco: `R$ ${evento.ticketPrice.toFixed(2).replace('.', ',')}`,
            data: new Date(evento.eventDate).toLocaleDateString('pt-BR')
          }
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailJsPayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro ao enviar e-mail:', errorText);
          emailStatus.erro = 'Falha no envio do e-mail';
        } else {
          emailStatus.enviado = true;
        }
      } catch (emailError) {
        console.error('Erro ao enviar e-mail:', emailError);
        emailStatus.erro = 'Erro no serviço de e-mail';
      }

      // Retorna resposta com status do e-mail
      return res.json({
        sucesso: true,
        emailEnviado: emailStatus.enviado,
        message: emailStatus.enviado
          ? 'Compra realizada e confirmação enviada para o seu e-mail!'
          : 'Compra realizada! Porém houve um problema ao enviar o e-mail de confirmação.',
        erro: emailStatus.erro
      });

    } catch (error) {
      console.error('Erro geral ao processar compra:', error);
      return res.status(500).json({
        sucesso: false,
        message: 'Erro ao processar a compra.',
        erro: error.message
      });
    }
  } catch (error) {
    console.error('Erro geral ao processar compra:', error);
    return res.status(500).json({ sucesso: false, message: 'Erro ao processar a compra.', error });
  }
};