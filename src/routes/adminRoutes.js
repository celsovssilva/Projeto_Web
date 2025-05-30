import express from "express";
import {
  createAdmin,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/adminController.js";

const router = express.Router();


router.get("/admin/:adminId/events", listEvents);

router.post("/admin", createAdmin);
router.post("/admin/:adminId/events", createEvent);
router.patch("/admin/:adminId/events/:eventId", updateEvent);
router.delete("/admin/:adminId/events/:eventId", deleteEvent);

export default router;
