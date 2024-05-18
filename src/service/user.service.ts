import { ObjectId, FilterQuery, Types } from 'mongoose';
import Users, { IUser } from '../models/user.model.js';
import { LoginSignupRequestBody } from '../types/auth.js';
import bcrypt from 'bcryptjs';

export const userExists = async (selector: string | ObjectId) => {
  const arrOfSelectors: FilterQuery<IUser>[] = [
    {
      email: selector?.toString(),
    },
  ];

  if (Types.ObjectId.isValid(selector?.toString())) {
    arrOfSelectors.push({
      _id: selector,
    });
  }

  const user = await Users.findOne({
    $or: arrOfSelectors,
  });

  return user?._id ? true : false;
};

export const getUser = async (selector: string | ObjectId) => {
  const arrOfSelectors: FilterQuery<IUser>[] = [
    {
      email: selector?.toString(),
    },
  ];

  if (Types.ObjectId.isValid(selector?.toString())) {
    arrOfSelectors.push({
      _id: selector,
    });
  }

  const user = await Users.findOne({
    $or: arrOfSelectors,
  });

  return user;
};

export const createUser = async ({ password, email }: LoginSignupRequestBody) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new Users({
    email,
    password: hashedPassword,
  });

  await user.save();

  return user;
};
