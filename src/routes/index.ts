import { Router } from 'express';
import Auth from './auth.js';
import User from './user.js';
import Coins from './coins.js';
import { requireAuth } from '../middlewares/auth.m.js';

const router = Router();

router.use('/auth', Auth);
router.use('/user', requireAuth, User);
router.use('/coins', requireAuth, Coins);

export default router;
