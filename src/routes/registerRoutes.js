import express from "express";
import { createUser } from "../controllers/userController.js";
import { createAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/cadastro", async (req, res, next) => {
  const { role } = req.body;
  if (role === "admin") {
    return createAdmin(req, res, next);
  } else {
    return createUser(req, res, next);
  }
});

export default router;