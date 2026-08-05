import { AxiosInstance } from "axios";
import defaultClient from "./client";
import type { Address } from "./types";

// Response shape not read by legacy code — treat defensively.
export function updateAddress(
  id: string,
  input: Partial<Address>,
  api: AxiosInstance = defaultClient
) {
  return api.put<unknown>(`/address/${id}`, input);
}
