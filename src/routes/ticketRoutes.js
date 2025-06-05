// src/routes/ticketRoutes.js
import express from 'express';
import { purchaseTicket } from '../controllers/ticketController.js';
import { PrismaClient } from '../../generated/prisma/index.js'; 
 import { authenticateToken } from "../Middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();


router.get('/pagamento-fake', /* authenticateToken, */ async (req, res) => {
  const { eventId } = req.query;
 

  if (!eventId) {
    req.flash('error_msg', 'ID do Evento não fornecido.');
    return res.redirect('/api/events'); 
  }
  try {
    const event = await prisma.Event.findUnique({
      where: { id: parseInt(eventId, 10) },
    });
    if (!event) {
      req.flash('error_msg', 'Evento não encontrado.');
      return res.redirect('/api/events');
    }

    res.render('pagamento_fake', { 
        event: event

    });
  } catch (error) {
    console.error("Erro ao carregar página de pagamento:", error);
    req.flash('error_msg', 'Erro ao carregar página de pagamento.');
    res.redirect('/api/events');
  }
});

router.post('/events/:eventId/processar-compra', /* authenticateToken, */ purchaseTicket);

router.get('/checkin-manual', (req, res) => {
const { ticketId, qrString } = req.query;

res.send(`Futuramente, aqui ocorreria o check-in do Ingresso ID: ${ticketId}`);
});

export default router;