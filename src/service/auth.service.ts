import { Request } from 'express';
import Users from '../models/user.model.js';
import Otps from '../models/otp.model.js';
import redisClient from '../config/redis.js';
import { getUser } from './user.service.js';
import { sendVerificationOtp } from './email.service.js';
import bcrypt from 'bcryptjs';

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

export const setUserSession = async (req: Request, userID: string) => {
  const userSessionID = `user-session:${userID}`;

  const sessionData = {
    sessionID: req.sessionID,
  };

  await redisClient.set(userSessionID, JSON.stringify(sessionData));
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
    console.log('Error sending OTP:', error);

    throw new Error('Error sending OTP');
  }
};
