import { Request, Response } from 'express';
import { ActivateAccountRequestBody, SignupRequestBody } from '../types/auth.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';
import validator from 'validator';
import { createUser, userExists } from '../service/user.service.js';
import { sendFirstOtp, setUserSession } from '../service/auth.service.js';

export const loginUser = async () => {};

export const logoutUser = async () => {};

export const registerUser = async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
  try {
    let { email, password, name } = req.body;

    email = email?.trim()?.toLowerCase();
    password = password?.trim();
    name = name?.trim();

    if (!email || !password || !name) {
      return sendErrorResponse(res, 400, null, 'Email, password and name are required');
    }

    if (!validator.isEmail(email)) {
      return sendErrorResponse(res, 400, null, 'Invalid email address');
    }

    if (password.length < 6) {
      return sendErrorResponse(res, 400, null, 'Password must be at least 6 characters long');
    }

    // check if the name is a valid english name and make sure there must be a minimum of 2 names separated by a space and each name must contain at least 2 characters
    if (!validator.isAlpha(name.replace(/\s/g, '')) || name.split(' ').length < 2 || name.split(' ').some(n => n.length < 2)) {
      return sendErrorResponse(res, 400, null, 'Invalid name format');
    }

    // make the first letter and the first letter after a space uppercase
    name = name.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    const userWithEmailExists = await userExists(email);

    if (userWithEmailExists) {
      return sendErrorResponse(res, 400, null, 'User with this email already exists');
    }

    const user = await createUser({ email, password, name });

    if (!user) {
      return sendErrorResponse(res, 500, null, 'Internal Server Error');
    }

    req.session.user = {
      _id: user._id,
    };

    await setUserSession(req, user._id);

    sendSuccessResponse(res, 201, null, 'User created successfully');

    sendFirstOtp({
      email,
      name: user.name.split(' ')[0],
    });
    return;
  } catch (error) {
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const activateUserAccount = async (req: Request<{}, {}, ActivateAccountRequestBody>, res: Response) => {
  try {
    const { otp } = req.body;

    if (!otp?.trim()) {
      return sendErrorResponse(res, 400, null, 'Email and OTP are required');
    }

    const user = await userExists(req.user?.email!);

    if (!user) {
      return sendErrorResponse(res, 400, null, 'User with this email does not exist');
    }

    // check if the otp is valid
    // check if the otp has expired
    // activate the account
    // send a welcome email

    return sendSuccessResponse(res, 200, null, 'Account activated successfully');
  } catch (error) {
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const forgotPassword = async () => {};

export const resetPassword = async () => {};
