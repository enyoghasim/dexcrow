export interface LoginRequestBody {
  email: string;
  password: string;
}
export interface SignupRequestBody {
  email: string;
  name: string;
  password: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}
export interface ResetPasswordRequestBody {
  password: string;
  confirmPassword: string;
}
export interface ResetPasswordRequestParams {
  selector: string;
  token: string;
}

export interface ActivateAccountRequestBody {
  otp: string;
}

// http://localhost:3000/reset-password/dad129710dbf1c64eaf6c32996e643a4/7d750583ff1a108d3b47fa5dfd59756e
