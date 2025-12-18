/**
 * Format Thai phone number to readable format
 * Input: "0816833133" → Output: "08 1683 3133"
 */
export const formatPhoneNumber = (phone: string | undefined | null): string => {
  if (!phone) return '-';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Thai format: XXX XXX XXXX (3-3-4)
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // If not 10 digits, return as-is
  return phone;
};
