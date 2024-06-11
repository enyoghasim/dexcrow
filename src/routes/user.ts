import { Request, Response, Router } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, null, 'User not authenticated');
    }
    return sendSuccessResponse(
      res,
      200,
      {
        _id: req.user._id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
        locks: req.user.locks,
        isEmailVerified: req.user?.isEmailVerified,
      },
      'User data retrieved successfully',
    );
  } catch (error) {
    return sendErrorResponse(res);
  }
});

router.get('/balance', (req: Request, res: Response) => {});

export default router;
