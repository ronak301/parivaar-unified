import client from "./baseApiClient";

export const getAllBusinesses = (
  communityId: string,
  query = "",
  filter: Record<string, unknown> = {}
) => {
  return client.post(`business/${communityId}`, {
    query,
    filter,
    limit: 50_000,
    skip: 0,
  });
};
