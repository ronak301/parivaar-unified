import { AxiosInstance } from "axios";
import defaultClient from "./client";
import type { Business } from "./types";

// Response shape not read by legacy code — treat defensively.
export function updateBusiness(
  id: string,
  input: Partial<Business>,
  api: AxiosInstance = defaultClient
) {
  return api.put<unknown>(`/business/${id}`, input);
}

export function createBusiness(
  input: Partial<Business>,
  api: AxiosInstance = defaultClient
) {
  return api.post<unknown>("/business/new", input);
}
