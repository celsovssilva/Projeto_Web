
import express from 'express';
import { listEventsForUser } from '../controllers/eventsController.js'; 

const router = express.Router();

router.get("/events", (req, res) => {
    res.render("eventos")
})

router.get('/events/user', listEventsForUser);

export default router;