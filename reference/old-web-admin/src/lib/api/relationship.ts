import { AxiosInstance } from "axios";
import defaultClient from "./client";

// Response shape not read by legacy code — treat defensively.
export function createRelation(
  userId: string,
  relativeId: string,
  relationshipType: string,
  api: AxiosInstance = defaultClient
) {
  return api.post<unknown>("/relationship/relation/new", {
    userId,
    relativeId,
    type: relationshipType,
  });
}

export function createRelative(
  input: Record<string, unknown>,
  api: AxiosInstance = defaultClient
) {
  return api.post<unknown>("/relationship/relative/new", input);
}
