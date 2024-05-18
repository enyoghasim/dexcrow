import { Router } from 'express';
import { activateUserAccount, forgotPassword, loginUser, registerUser, resetPassword } from '../controllers/authController.js';
import { loggedOutOnly, requireAuth } from '../middlewares/auth.m.js';

const router = Router();

router.post('/register', loggedOutOnly, registerUser);

router.post('/activate-account', requireAuth, activateUserAccount);

router.post('/login', loggedOutOnly, loginUser);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:selector/:token', resetPassword);

export default router;
