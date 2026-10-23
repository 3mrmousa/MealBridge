import { z } from "zod";

export const EGYPTIAN_PHONE_REGEX = /^(?:\+20|20|0)?1[0125][0-9]{8}$/;

export const egyptianPhoneSchema = z
  .string()
  .regex(
    EGYPTIAN_PHONE_REGEX,
    "Invalid Egyptian phone number. Must start with (+20, 20, 0, or no prefix) followed by 10 digits starting with 10, 11, 12, or 15 (e.g. 01015xxxx67, +201015xxxx67)",
  );

export const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return "";
  const cleaned = phone.trim().replace(/\s+/g, "");
  return cleaned.startsWith("+20")
    ? cleaned
    : cleaned.startsWith("20")
      ? `+${cleaned}`
      : cleaned.startsWith("0")
        ? `+2${cleaned}`
        : `+20${cleaned}`;
};

