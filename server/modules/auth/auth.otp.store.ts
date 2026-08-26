export type OtpSessionDataRegisterRequest = {
  hashedOtp: string;
  user: {
    name: string;
    email: string;
    hashedPassword: string;
    phone: string;
    role: string;
  };
}

export type OtpSessionDataPasswordForgotRequest = {
  hashedOtp: string;
  user: {
    email: string;
  };
}
