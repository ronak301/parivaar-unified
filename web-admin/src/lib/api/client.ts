import axios, { AxiosInstance } from 'axios';
import { getBackendUrl } from '@/lib/api/backend-url';

export const API_BASE_URL = `${getBackendUrl()}/api`;

function createClient(token?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.error ?? error.message ?? 'Request failed';
      const wrapped = new Error(message) as Error & {
        status?: number;
        details?: unknown;
        response?: typeof error.response;
      };
      wrapped.status = error.response?.status;
      // Preserve backend validation details (e.g. zod field errors) so API
      // routes can surface a specific message instead of a generic one.
      wrapped.details = error.response?.data?.details;
      wrapped.response = error.response;
      return Promise.reject(wrapped);
    },
  );

  return instance;
}

const client = createClient();
export default client;

export function createAuthenticatedClient(token: string): AxiosInstance {
  return createClient(token);
}
