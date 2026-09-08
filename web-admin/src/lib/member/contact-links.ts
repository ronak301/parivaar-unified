import type { Business } from '@parivaar/shared';

/** Normalise an Indian number to 10 digits: strips spaces, a leading 0, or a +91 / 91 prefix. */
function normalizeIndianDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return digits;
}

export function telLink(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = normalizeIndianDigits(phone);
  return digits ? `tel:+91${digits}` : undefined;
}

export function whatsappLink(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = normalizeIndianDigits(phone);
  return digits ? `https://wa.me/91${digits}` : undefined;
}

type PopulatedOwner = { phone?: string };

/**
 * Phone to show on a business card: the business's own number, else the
 * owner's (the backend already strips it when the owner has hidden it).
 */
export function getBusinessContactPhone(business: Business): string | undefined {
  if (business.phone) return business.phone;
  const owner = business.ownerId as unknown as PopulatedOwner | string | undefined;
  return owner && typeof owner === 'object' ? owner.phone : undefined;
}
