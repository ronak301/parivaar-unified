import client from "./baseApiClient";

export const getAllBusinesses = (
  communityId: string,
  query = "",
  filter = {}
) => {
  return client.post(`business/${communityId}`, {
    query,
    filter,
    limit: 300,
    skip: 0,
  });
};
