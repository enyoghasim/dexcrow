import { ObjectId, Types } from 'mongoose';
import Axios from './axios.service.js';
import { getUser } from './user.service.js';
import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';
import { config } from 'dotenv';

config();

Axios.defaults.baseURL = process.env.PAYMENT_SERVICE_URL;
Axios.defaults.headers['x-api-key'] = process.env.NOW_PAYMENTS_API_KEY!;

export const initUserAccount = async (userId: ObjectId) => {
  try {
    if (!userId || !Types.ObjectId.isValid(userId?.toString())) {
      throw new Error('Invalid user ID');
    }

    const user = await getUser(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user?.nowPaymentsSubAccountId) {
      return;
    }

    const nowPaymentsAuthToken = await redisClient.get('now-payments-auth-token');

    if (!nowPaymentsAuthToken) {
      const { data } = await Axios.post('/auth', {
        email: process.env.NOW_PAYMENTS_EMAIL,
        password: process.env.NOW_PAYMENTS_PASSWORD,
      });

      if (!data?.token) {
        throw new Error('Failed to create user account');
      }

      // set the token to expire in 15minutes
      await redisClient.set('now-payments-auth-token', data.token, {
        EX: 15 * 60,
      });
    }

    // Create user account
    const { data } = await Axios.post(
      '/sub-partner/balance',
      {
        name: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${nowPaymentsAuthToken}`,
        },
      },
    );
    if (data?.result && data?.result?.id) {
      user.nowPaymentsSubAccountId = data.result.id;
      await user.save();
    }
  } catch (error) {
    logger.error(error?.toString());
    throw new Error('Failed to create user account');
  }
};

export const getProviderSelectedCurrencies = async () => {
  try {
    const { data } = await Axios.get('/merchant/coins');

    if (!data?.selectedCurrencies) {
      throw new Error('Failed to fetch available coins');
    }

    return data.selectedCurrencies;
  } catch (error) {
    logger.error(error?.toString());
    throw new Error('Failed to fetch available coins');
  }
};

export const fundUserAccount = async (userId: ObjectId, amount: number) => {};
