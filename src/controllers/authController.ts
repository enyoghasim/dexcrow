import { Request, Response } from 'express';
import { LoginSignupRequestBody } from '../types/auth.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';
import validator from 'validator';
import { createUser, userExists } from '../service/user.service.js';
import { setUserSession } from '../service/auth.service.js';

export const loginUser = async () => {};

export const logoutUser = async () => {};

export const registerUser = async (req: Request<{}, {}, LoginSignupRequestBody>, res: Response) => {
  try {
    let { email, password } = req.body;

    email = email?.trim()?.toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return sendErrorResponse(res, 400, null, 'Email and password are required');
    }

    if (!validator.isEmail(email)) {
      return sendErrorResponse(res, 400, null, 'Invalid email address');
    }

    if (password.length < 6) {
      return sendErrorResponse(res, 400, null, 'Password must be at least 6 characters long');
    }

    const userWithEmailExists = await userExists(email);

    if (userWithEmailExists) {
      return sendErrorResponse(res, 400, null, 'User with this email already exists');
    }

    const user = await createUser({ email, password });

    if (!user) {
      return sendErrorResponse(res, 500, null, 'Internal Server Error');
    }

    req.session.user = {
      _id: user._id,
    };

    await setUserSession(req, user._id);

    sendSuccessResponse(res, 201, null, 'User created successfully');
    return;
  } catch (error) {
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const forgotPassword = async () => {};

export const resetPassword = async () => {};
