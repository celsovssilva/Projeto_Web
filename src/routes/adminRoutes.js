import express from "express";
import {
  createAdmin,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  loginAdmin,
  renderEventChecklistPage,
  processTicketCheckin
} from "../controllers/adminController.js";
import { authenticateToken, isAdmin } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin/register", createAdmin);

router.post("/loginAdmin", loginAdmin);

router.get("/admin/events", authenticateToken, isAdmin, listEvents);
router.post("/admin/events", authenticateToken, isAdmin, createEvent);
router.patch("/admin/events/:eventId", authenticateToken, isAdmin, updateEvent);
router.delete("/admin/events/:eventId", authenticateToken, isAdmin, deleteEvent);

router.get("/admin/event/:eventId/checklist", authenticateToken, isAdmin, renderEventChecklistPage);
router.post("/admin/ticket/:ticketId/checkin", authenticateToken, isAdmin, processTicketCheckin);

export default router;