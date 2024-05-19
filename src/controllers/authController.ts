import { Request, Response } from 'express';
import { ActivateAccountRequestBody, LoginRequestBody, SignupRequestBody } from '../types/auth.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';
import validator from 'validator';
import { createUser, updateUser, userExists } from '../service/user.service.js';
import { clearOtp, sendFirstOtp, setUserSession, verifyOtp } from '../service/auth.service.js';
import Otps from '../models/otp.model.js';

export const loginUser = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  // try {
  // } catch (error) {
  //   console.log('Error logging in user:', error);
  //   return sendErrorResponse(res, 500, null, 'Internal Server Error');
  // }
};

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
    console.log('Error registering user:', error);
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const activateUserAccount = async (req: Request<{}, {}, ActivateAccountRequestBody>, res: Response) => {
  try {
    if (req.user?.isEmailVerified) {
      return sendErrorResponse(res, 400, null, 'Account is already activated');
    }

    // TODO - lock the account if the user tries to input the otp too many times
    let { otp } = req.body;

    if (!otp) {
      return sendErrorResponse(res, 400, null, 'Email and OTP are required');
    }

    if (!validator.isNumeric(otp) || otp.length !== 6) {
      return sendErrorResponse(res, 400, null, 'Invalid OTP');
    }

    // check if the otp is valid
    const isValid = await verifyOtp(req.user?.email!, otp, 'activate-account');

    if (!isValid) {
      return sendErrorResponse(res, 400, null, 'Invalid or expired OTP');
    }

    // activate the account
    const newUserDetails = await updateUser(req.user?._id, {
      isEmailVerified: true,
    });

    if (!newUserDetails) {
      return sendErrorResponse(res, 500, null, 'Internal Server Error');
    }

    sendSuccessResponse(res, 200, null, 'Account activated successfully');
    await clearOtp(req.user?.email!, 'activate-account');
    return;
  } catch (error) {
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const resendActivationOtp = async (req: Request, res: Response) => {
  try {
    await clearOtp(req.user?.email!, 'activate-account');

    // TODO - lock the account if the user tries to resend the otp too many times
    sendSuccessResponse(res, 200, null, 'OTP sent successfully');

    sendFirstOtp({
      email: req.user?.email!,
      name: req.user?.name.split(' ')[0]!,
    });
    return;
  } catch (error) {
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const forgotPassword = async () => {};

export const resetPassword = async () => {};
