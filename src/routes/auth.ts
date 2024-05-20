import { Router } from 'express';
import {
  activateUserAccount,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resendActivationOtp,
  resetPassword,
} from '../controllers/authController.js';
import { loggedOutOnly, requireAuth } from '../middlewares/auth.m.js';

const router = Router();

router.post('/register', loggedOutOnly, registerUser);

router.post('/activate-account', requireAuth, activateUserAccount);

router.get('/resend-activation-otp', requireAuth, resendActivationOtp);

router.post('/login', loggedOutOnly, loginUser);

router.get('/logout', requireAuth, logoutUser);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:selector/:token', resetPassword);

export default router;
