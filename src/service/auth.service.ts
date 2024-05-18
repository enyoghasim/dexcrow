import { Request } from 'express';
import sessionStore from '../config/sessionStore.js';
import redisClient from '../config/redis.js';

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

  return true;
};

export const setUserSession = async (req: Request, userID: string) => {
  const userSessionID = `user-session:${userID}`;

  const sessionData = {
    sessionID: req.sessionID,
  };

  await redisClient.set(userSessionID, JSON.stringify(sessionData));
};
