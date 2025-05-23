import express from 'express';

import { forgotPassword, resetPassword, resetPasswordWithoutToken } from '../controllers/passwordController.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/reset-password-test', resetPasswordWithoutToken); 

export default router;