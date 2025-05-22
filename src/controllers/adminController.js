import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const createAdmin = async (req, res) => {
  const { name, sobrenome, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.Admin.create({
      data: { name, sobrenome, email, password: hashedPassword },
    });
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: "Email already in use" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const createEvent = async (req, res) => {
  const { adminId } = req.params;
  const { name, description, eventDate, ticketDeadline, ticketPrice, status } = req.body;
  try {
    const newEvent = await prisma.Event.create({
      data: {
        name,
        description,
        eventDate: new Date(eventDate),
        ticketDeadline: new Date(ticketDeadline),
        ticketPrice,
        status,
        admin: { connect: { id: parseInt(adminId) } },
      },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEvent = async (req, res) => {
  const { adminId, eventId } = req.params;
  const { name, description, eventDate, ticketDeadline, ticketPrice, status } = req.body;
  try {
    const event = await prisma.Event.findUnique({
      where: { id: parseInt(eventId) },
    });
    if (!event || event.adminId !== parseInt(adminId)) {
      return res.status(404).json({ error: "Event not found for this admin" });
    }
    const updatedEvent = await prisma.Event.update({
      where: { id: parseInt(eventId) },
      data: { name, description, eventDate: new Date(eventDate), ticketDeadline: new Date(ticketDeadline), ticketPrice, status },
    });
    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteEvent = async (req, res) => {
  const { adminId, eventId } = req.params;
  try {
    const event = await prisma.Event.findUnique({
      where: { id: parseInt(eventId) },
    });
    if (!event || event.adminId !== parseInt(adminId)) {
      return res.status(404).json({ error: "Event not found for this admin" });
    }
    await prisma.Event.delete({
      where: { id: parseInt(eventId) },
    });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};