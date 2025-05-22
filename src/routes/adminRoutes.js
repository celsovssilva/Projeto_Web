import express from "express";
import {
  createAdmin,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/admin", createAdmin);
router.post("/admin/:adminId/events", createEvent);
router.put("/admin/:adminId/events/:eventId", updateEvent);
router.delete("/admin/:adminId/events/:eventId", deleteEvent);

export default router;