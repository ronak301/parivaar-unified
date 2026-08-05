import axios, { AxiosInstance } from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.parivaarapp.in/";

function createClient(token?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.message ?? error.message ?? "Request failed";
      return Promise.reject(new Error(message));
    }
  );

  return instance;
}

// Unauthenticated client — used for public flows (join form, OTP request/verify).
const client = createClient();

export default client;

// Call only from Server Components / Server Actions / Route Handlers, where the
// admin session's httpOnly cookie is readable via next/headers. The cookie's JWT
// is never exposed to the browser, so authenticated admin calls must be server-side.
export function createAuthenticatedClient(token: string): AxiosInstance {
  return createClient(token);
}
