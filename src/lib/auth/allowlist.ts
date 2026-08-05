function normalizePhone(number: string): string {
  return number.replace(/\D/g, "").slice(-10);
}

export function isAllowedAdminPhone(number: string): boolean {
  const allowed = process.env.ADMIN_ALLOWED_PHONE;
  if (!allowed) return false;
  return normalizePhone(number) === normalizePhone(allowed);
}
