import { Request, Response } from 'express';
import logger from '../utils/logger.js';
import { getProviderSelectedCurrencies } from '../service/payment.service.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';

export const getAvailableCoins = async (req: Request, res: Response) => {
  try {
    const availableCoins = await getProviderSelectedCurrencies();

    return sendSuccessResponse(res, 200, availableCoins);
  } catch (error) {
    logger.error(error?.toString());

    return sendErrorResponse(res, 500, null, 'Failed to fetch available coins');
  }
};

export const generateAddressesForUser = async (req: Request, res: Response) => {};
