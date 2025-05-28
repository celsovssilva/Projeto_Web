import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", verificarToken, login);

export default router;
