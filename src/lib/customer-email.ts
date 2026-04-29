export function normalizeCustomerEmail(input?: string | null) {
  const email = (input || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}
