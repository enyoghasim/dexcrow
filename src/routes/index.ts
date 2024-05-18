import { Router } from 'express';
import Auth from './auth.js';
import User from './user.js';
import { requireAuth } from '../middlewares/auth.m.js';

const router = Router();

router.use('/auth', Auth);
router.use('/user', requireAuth, User);

export default router;
