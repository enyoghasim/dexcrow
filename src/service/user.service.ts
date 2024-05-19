import { ObjectId, FilterQuery, Types } from 'mongoose';
import Users, { IUser } from '../models/user.model.js';
import { SignupRequestBody } from '../types/auth.js';
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

export const getUser = async (selector: string | ObjectId, selectDetails?: string) => {
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
  }).select(selectDetails ?? '');

  return user;
};

export const createUser = async ({ password, email, name }: SignupRequestBody) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new Users({
    email,
    password: hashedPassword,
    name,
  });

  await user.save();

  return user;
};

export const updateUser = async (selector: string | ObjectId, update: Partial<IUser>) => {
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

  const user = await Users.findOneAndUpdate(
    {
      $or: arrOfSelectors,
    },
    update,
    { new: true },
  );

  return user;
};
