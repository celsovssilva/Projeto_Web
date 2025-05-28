import express from 'express';

import { forgotPassword, resetPassword } from '../controllers/passwordController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get("/forgot-password", (req, res) => {
  res.render("enviarEmail"); 
});

router.get("/reset-password", (req, res) => {
  res.render("recuperar"); 
});

router.post('/forgot-password', verificarToken, forgotPassword);
router.post('/reset-password', verificarToken, resetPassword);


export default router;