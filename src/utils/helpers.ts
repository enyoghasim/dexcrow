import { randomBytes } from 'crypto';

export const generateRandomHexadecimalToken = (): string => {
  return randomBytes(16).toString('hex');
};
