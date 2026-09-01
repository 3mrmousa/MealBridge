export const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return "";
  return phone.startsWith("+20")
    ? phone
    : phone.startsWith("20")
      ? `+${phone}`
      : phone.startsWith("0")
        ? `+2${phone}`
        : `+20${phone}`;
};
