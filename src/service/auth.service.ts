import { Request } from 'express';
import Users from '../models/user.model.js';
import Otps from '../models/otp.model.js';
import redisClient from '../config/redis.js';
import { getUser } from './user.service.js';
import { sendVerificationOtp } from './email.service.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';
import sessionStore from '../config/sessionStore.js';
import VerificationTokens from '../models/verification-tokens.model.js';
import { generateRandomHexadecimalToken } from '../utils/helpers.js';
import { ObjectId, Types } from 'mongoose';

export const autenticateSession = async (req: Request): Promise<boolean> => {
  const user = req.session?.user;

  if (!user || !user?._id) {
    return false;
  }

  const userSessionID = `user-session:${user._id}`;

  const session = await redisClient.get(userSessionID);

  if (!session) {
    return false;
  }

  const sessionData = JSON.parse(session);

  if (sessionData?.sessionID !== req.sessionID) {
    return false;
  }

  const userDetails = await getUser(user._id);

  if (!userDetails) {
    return false;
  }

  req.user = userDetails;
  return true;
};

export const getUserSession = async (req: Request, userId: string) => {
  const userSessionID = `user-session:${userId}`;

  const session = await redisClient.get(userSessionID);

  if (!session) {
    return null;
  }

  const sessionData = JSON.parse(session);

  if (sessionData?.sessionID !== req.sessionID) {
    return null;
  }

  return sessionData;
};

export const setUserSession = async (req: Request, userID: string) => {
  const userSessionID = `user-session:${userID}`;

  const sessionData = {
    sessionID: req.sessionID,
  };

  await redisClient.set(userSessionID, JSON.stringify(sessionData), {
    EX: 60 * 60 * 24 * 7, // 1 week
  });
};

export const clearUserSession = async (req: Request, userID: string | null, sessionID?: string) => {
  if (sessionID && !userID) {
    await sessionStore.destroy(sessionID);
  } else {
    const userSession = await getUserSession(req, userID!);

    if (!userSession) {
      return;
    }

    const sessionID = userSession.sessionID;

    await sessionStore.destroy(sessionID);
  }
};

export const sendFirstOtp = async ({ email, name }: { email: string; name: string }) => {
  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP in db
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp.toString(), salt);

    const otpDoc = new Otps({
      user: email,
      type: 'activate-account',
      otp: hashedOtp,
      // set to expire in 10 minutes
      expires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await otpDoc.save();

    // Send OTP to user
    sendVerificationOtp({
      to: email,
      templateName: 'email-verification-otp',
      context: {
        name,
        otp,
      },
      subject: `Your verification OTP - ${otp}`,
    });
  } catch (error) {
    logger.error('Error sending OTP:', error);

    throw new Error('Error sending OTP');
  }
};

export const sendForgotPasswordToken = async ({ email, user, name }: { email: string; name: string; user: string }) => {
  try {
    const selector = generateRandomHexadecimalToken();
    const token = generateRandomHexadecimalToken();

    const salt = await bcrypt.genSalt(10);

    const hashedToken = await bcrypt.hash(token, salt);

    let userObjectID = new Types.ObjectId(user);

    const verificationToken = new VerificationTokens({
      user: userObjectID,
      selector,
      token: hashedToken,
      type: 'reset-password',
      expires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await verificationToken.save();

    const tokenUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${selector}/${token}`;

    sendVerificationOtp({
      to: email,
      templateName: 'forgot-password-token',
      context: {
        name,
        token: tokenUrl,
      },
      subject: 'Reset your password',
    });
  } catch (error) {
    logger.error('Error sending forgot password token:', error);

    throw new Error('Error sending forgot password token');
  }
};

export const verifyOtp = async (user: string, otp: string, type: string) => {
  const otpDetails = await Otps.findOne({
    user: user,
    type,
    expires: { $gt: new Date() },
  });

  if (!otpDetails) {
    return false;
  }

  const isMatch = await bcrypt.compare(otp, otpDetails.otp);

  if (!isMatch) {
    return false;
  }

  return true;
};

export const clearOtp = async (user: string, type: string) => {
  await Otps.deleteMany({
    user,
    type,
  });
};

export const clearVerificationTokens = async (user: string, type: string) => {
  await VerificationTokens.deleteMany({
    user,
    type,
  });
};

export const verifyToken = async (
  // user: string,
  {
    selector,
    token,
    type,
  }: {
    selector: string;
    token: string;
    type: string;
  },
) => {
  const tokenDetails = await VerificationTokens.findOne({
    selector,
    type,
    expires: { $gt: new Date() },
  });

  if (!tokenDetails) {
    return false;
  }

  const isMatch = await bcrypt.compare(token, tokenDetails.token);

  if (!isMatch) {
    return false;
  }

  return tokenDetails.user;
};
