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
