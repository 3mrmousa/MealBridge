export type OtpSessionDatachangeEmailRequest = {
  hashedOtpCurrentEmail: string;
  hashedOtpNewEmail: string | null;
  newEmail: string;
  user: {
    email: string;
  };
  step1: boolean | null;
};
