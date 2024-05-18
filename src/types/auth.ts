export interface LoginRequestBody {
  email: string;
  password: string;
}
export interface SignupRequestBody {
  email: string;
  name: string;
  password: string;
}

export interface ForgetPasswordRequestBody {
  email: string;
}

export interface ActivateAccountRequestBody {
  otp: string;
}
