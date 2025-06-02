
import express from 'express';
import { listEventsForUser, getEventById } from '../controllers/eventsController.js'; 

const router = express.Router();

router.get("/events", (req, res) => {
    res.render("eventos")
})

router.get('/events/user', listEventsForUser);
router.get("/evento/:id", getEventById);

export default router;