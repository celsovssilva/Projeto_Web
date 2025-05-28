import express from 'express';

import { forgotPassword, resetPassword } from '../controllers/passwordController.js';

const router = express.Router();

router.get("/forgot-password", (req, res) => {
  res.render("recuperar_senha"); 
});

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


export default router;