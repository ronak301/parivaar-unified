import { createAuthenticatedClient } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";

export async function getAdminClient() {
  const token = await getSessionToken();
  if (!token) {
    throw new Error(
      "No admin token found. Set ADMIN_API_TOKEN in .env.local"
    );
  }
  return createAuthenticatedClient(token);
}
