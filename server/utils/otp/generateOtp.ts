import crypto from "crypto";

export function generateOtp(): { otp: string; hashedOtp: string } {
  const otp = crypto.randomInt(100000, 1000000).toString();

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  return { otp, hashedOtp };
}

export function verifyOtp(otp: string, hashedOtp: string): boolean {
  const computedHashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  return computedHashedOtp === hashedOtp;
}