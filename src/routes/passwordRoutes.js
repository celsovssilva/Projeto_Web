import express from 'express';
import rateLimit from 'express-rate-limit';
import { forgotPassword, resetPassword } from '../controllers/passwordController.js';

const router = express.Router();

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { error: "Muitas tentativas de recuperação. Tente novamente mais tarde." }
});

router.get("/forgot-password", (req, res) => {
  res.render("enviarEmail"); 
});

router.get("/reset-password", (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).render("enviarEmail", { erro: "Acesso não autorizado. Link inválido ou expirado." });
  }
  res.render("recuperar");
});

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

export default router;