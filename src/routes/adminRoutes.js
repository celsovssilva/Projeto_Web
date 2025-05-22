import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";

const router = express.Router();
const prisma = new PrismaClient();
router.post("/admin", async (req, res) => {
    const { name, sobrenome, email, password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newAdmin = await prisma.admin.create({
        data: {
          name,
          sobrenome,
          email,
          password: hashedPassword,
        },
      });
  
      res.status(201).json(newAdmin);
    } catch (error) {
      console.error("Error creating admin:", error);
      if (error.code === 'P2002') {  // Erro de unique constraint
        res.status(400).json({ error: "Email already in use" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

router.post("/admin/:adminId/events", async (req, res) => {
  const { adminId } = req.params;
  const { title, description, date, ticketPrice, ticketLimit } = req.body;

  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        ticketPrice,
        ticketLimit,
        admin: { connect: { id: parseInt(adminId) } },
      },
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.put("/admin/:adminId/events/:eventId", async (req, res) => {
  const { adminId, eventId } = req.params;
  const { title, description, date, ticketPrice, ticketLimit } = req.body;

  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });

    if (!event || event.adminId !== parseInt(adminId)) {
      return res.status(404).json({ error: "Event not found for this admin" });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: {
        title,
        description,
        date: new Date(date),
        ticketPrice,
        ticketLimit,
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete("/admin/:adminId/events/:eventId", async (req, res) => {
  const { adminId, eventId } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });

    if (!event || event.adminId !== parseInt(adminId)) {
      return res.status(404).json({ error: "Event not found for this admin" });
    }

    await prisma.event.delete({
      where: { id: parseInt(eventId) },
    });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
