import express from "express";
import {
  createAdmin,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/admin",  verificarToken, createAdmin);
router.post("/admin/:adminId/events",  verificarToken, createEvent);
router.put("/admin/:adminId/events/:eventId", verificarToken, updateEvent);
router.delete("/admin/:adminId/events/:eventId",  verificarToken, deleteEvent);

export default router;