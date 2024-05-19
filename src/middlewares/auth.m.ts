import { NextFunction, Request, Response } from 'express';
import sessionStore from '../config/sessionStore.js';
import redisClient from '../config/redis.js';
import { sendErrorResponse } from '../utils/response.js';
import { autenticateSession } from '../service/auth.service.js';
import logger from '../utils/logger.js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthenticated = await autenticateSession(req);

    if (isAuthenticated) {
      return next();
    }

    return sendErrorResponse(res, 401, null, 'Unauthorized');
  } catch (error) {
    logger.error(error);

    return sendErrorResponse(res, 401, null, 'Unauthorized');
  }
};

export const loggedOutOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthenticated = await autenticateSession(req);

    if (isAuthenticated) {
      return sendErrorResponse(res, 401, null, 'Unauthorized');
    }

    return next();
  } catch (error) {
    logger.error(error);
    return sendErrorResponse(res, 401, null, 'Unauthorized');
  }
};
