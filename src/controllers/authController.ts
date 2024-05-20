import { Request, Response } from 'express';
import {
  ActivateAccountRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  ResetPasswordRequestBody,
  ResetPasswordRequestParams,
  SignupRequestBody,
} from '../types/auth.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';
import validator from 'validator';
import { createUser, getUser, updateUser, userExists } from '../service/user.service.js';
import {
  clearOtp,
  clearUserSession,
  clearVerificationTokens,
  sendFirstOtp,
  sendForgotPasswordToken,
  setUserSession,
  verifyOtp,
  verifyToken,
} from '../service/auth.service.js';
import Otps from '../models/otp.model.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import { IRequest } from '../types/core.js';

export const loginUser = async (req: IRequest<LoginRequestBody>, res: Response) => {
  try {
    // TODO check for account lock and also add 2FA support
    let { email, password } = req.body;
    email = email?.trim()?.toLowerCase();

    if (!email || !password) {
      return sendErrorResponse(res, 400, null, 'Email and password are required');
    }

    if (!validator.isEmail(email)) {
      return sendErrorResponse(res, 400, null, 'Invalid email address');
    }

    if (password.length < 6) {
      return sendErrorResponse(res, 400, null, 'Invalid password');
    }

    const user = await getUser(email, '+password');

    if (!user) {
      return sendErrorResponse(res, 400, null, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendErrorResponse(res, 400, null, 'Invalid credentials');
    }

    await clearUserSession(req, user._id);

    req.session.user = {
      _id: user._id,
    };

    await setUserSession(req, user._id);

    return sendSuccessResponse(res, 200, null, 'Logged in successfully');
  } catch (error) {
    logger.error(error?.toString());
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const logoutUser = async (req: IRequest<SignupRequestBody>, res: Response) => {
  try {
    await clearUserSession(req, null, req.sessionID!);

    return sendSuccessResponse(res, 200, null, 'Logged out successfully');
  } catch (error) {
    logger.error(error);
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const registerUser = async (req: IRequest<SignupRequestBody>, res: Response) => {
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
    logger.error('Error registering user:', error);
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};

export const activateUserAccount = async (req: IRequest<ActivateAccountRequestBody>, res: Response) => {
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
    if (req.user?.isEmailVerified) {
      return sendErrorResponse(res, 400, null, 'Account is already activated');
    }

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

export const forgotPassword = async (req: IRequest<ForgotPasswordRequestBody>, res: Response) => {
  try {
    let { email } = req.body;
    email = email?.trim()?.toLowerCase();

    if (!email) {
      return sendErrorResponse(res, 400, null, 'Email is required');
    }

    if (!validator.isEmail(email)) {
      return sendErrorResponse(res, 400, null, 'Invalid email address');
    }

    const userDetails = await getUser(email);

    if (!userDetails) {
      return sendErrorResponse(res, 400, null, 'User with this email does not exist');
    }

    await clearVerificationTokens(userDetails._id, 'reset-password');

    sendSuccessResponse(res, 200, null, 'Password reset link sent successfully');

    sendForgotPasswordToken({
      email: userDetails.email,
      user: userDetails._id,
      name: userDetails.name.split(' ')[0],
    });
    return;
  } catch (error) {
    logger.error('User forgot password error');
    return sendErrorResponse(res);
  }
};

export const resetPassword = async (req: IRequest<ResetPasswordRequestBody, ResetPasswordRequestParams>, res: Response) => {
  try {
    const { password, confirmPassword } = req.body;
    const { selector, token } = req.params;

    if (!selector?.trim() || !token?.trim()) {
      return sendErrorResponse(res, 401, null, 'All fields are required.');
    }

    if (!validator.isHexadecimal(selector) || !validator.isHexadecimal(token)) {
      return sendErrorResponse(res, 401, null, 'Invalid password reset link');
    }

    if (!password?.trim() || !confirmPassword?.trim()) {
      return sendErrorResponse(res, 401, null, 'All fields are required.');
    }

    if (password.length < 6) {
      return sendErrorResponse(res, 401, null, 'Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return sendErrorResponse(res, 401, null, 'Passwords do not match.');
    }

    const userWithToken = await verifyToken({ selector, token, type: 'reset-password' });

    if (!userWithToken) {
      return sendErrorResponse(res, 401, null, 'Invalid or expired password reset link.');
    }

    const userDetails = await getUser(userWithToken?.toString());

    if (!userDetails) {
      return sendErrorResponse(res, 401, null, 'Invalid or expired password reset link.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserDetails = await updateUser(userDetails._id, {
      password: hashedPassword,
    });

    if (!newUserDetails) {
      return sendErrorResponse(res, 500, null, 'Internal Server Error');
    }

    sendSuccessResponse(res, 200, null, 'Password reset successfully');
    await clearVerificationTokens(userDetails._id, 'reset-password');
    return;
  } catch (error) {
    logger.error('Error resetting password:', error);
    return sendErrorResponse(res, 500, null, 'Internal Server Error');
  }
};
