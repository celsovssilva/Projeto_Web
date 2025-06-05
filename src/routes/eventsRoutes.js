import express from 'express';
import { listEventsForUser, getEventById, comprarEvento, authenticateToken } from '../controllers/eventsController.js'; 

const router = express.Router();

router.get("/events", listEventsForUser);

router.get('/events/user', listEventsForUser);
router.get("/evento/:id", getEventById);

router.post("/comprar/:id", authenticateToken, comprarEvento);

export default router;