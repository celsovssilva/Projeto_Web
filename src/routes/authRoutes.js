import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

router.get("/login", (req, res) => {
  const errorMessages = req.flash('error');
  res.render("login", {
    erro: errorMessages.length > 0 ? errorMessages[0] : undefined
  });
});

router.post("/login", login);

export default router;
