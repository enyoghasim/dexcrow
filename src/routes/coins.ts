import { Router } from 'express';
import { getAvailableCoins } from '../controllers/paymentController.js';

const router = Router();

router.get('/', getAvailableCoins);

export default router;
