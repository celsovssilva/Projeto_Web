import express from "express";
import {
  createAdmin,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/adminController.js";

const router = express.Router();

// Em vez de criar uma função anônima que só renderiza uma tela,
// você chama a função listEvents que faz a consulta e passa os dados.
router.get("/admin/:adminId/events", listEvents);

router.post("/admin", createAdmin);
router.post("/admin/:adminId/events", createEvent);
router.patch("/admin/:adminId/events/:eventId", updateEvent);
router.delete("/admin/:adminId/events/:eventId", deleteEvent);

export default router;
