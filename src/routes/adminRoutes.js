import express from "express";
import {
  createAdmin,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  updateAdminProfile
} from "../controllers/adminController.js";
import { authenticateToken, isAdmin } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin", createAdmin);

router.get("/admin/events", authenticateToken, isAdmin, listEvents);
router.post("/admin/events", authenticateToken, isAdmin, createEvent);
router.patch("/admin/events/:eventId", authenticateToken, isAdmin, updateEvent);
router.delete("/admin/events/:eventId", authenticateToken, isAdmin, deleteEvent);
router.put("/profile/:adminId", authenticateToken, isAdmin, updateAdminProfile);
export default router;