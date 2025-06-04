import express from 'express';
import { listEventsForUser, getEventById, comprarEvento, authenticateToken } from '../controllers/eventsController.js'; 

const router = express.Router();

router.get("/events", (req, res) => {
    res.render("eventos")
});

router.get('/events/user', listEventsForUser);
router.get("/evento/:id", getEventById);

// ROTA DE COMPRA DE INGRESSO (protegida)
router.post("/comprar/:id", authenticateToken, comprarEvento);

export default router;