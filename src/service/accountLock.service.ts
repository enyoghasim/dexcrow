import Users from '../models/user.model.js';

const LOCK_DURATIONS: { [key: string]: number } = {
  login: 30 * 60 * 1000, // 30 minutes
  otp: 10 * 60 * 1000, // 10 minutes
};

export const addLock = async (userId: string, type: string) => {
  const user = await Users.findById(userId);

  if (!user) throw new Error('Users not found');

  const unlockTime = new Date(Date.now() + LOCK_DURATIONS[type]);

  const existingLockIndex = user.locks.findIndex(lock => lock.type === type);

  if (existingLockIndex > -1) {
    user.locks[existingLockIndex].unlockTime = unlockTime;
  } else {
    user.locks.push({ type, unlockTime });
  }

  await user.save();
};

export const removeLock = async (userId: string, type: string) => {
  const user = await Users.findById(userId);

  if (!user) throw new Error('Users not found');

  user.locks = user.locks.filter(lock => lock.type !== type);

  await user.save();
};

export const isLocked = async (userId: string, type: string) => {
  const user = await Users.findById(userId);

  if (!user) throw new Error('Users not found');

  const lock = user.locks.find(lock => lock.type === type);

  if (lock && lock.unlockTime > new Date()) {
    return true;
  }

  if (lock && lock.unlockTime <= new Date()) {
    await removeLock(userId, type);
  }

  return false;
};
