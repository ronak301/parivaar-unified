import axios from "axios";
import client, { API_BASE_URL } from "./baseApiClient";

export const getAllCommunities = () => {
  return client.get("/community/all");
};

export const getUserCommunities = (userId: string) => {
  return client.get(`user/communities/${userId}`);
};

export const getCommunityDetailsForId = (id: string) => {
  return client.get(`/community/${id}`);
};

export const getCommunityMembersForCommunityId = (
  id: string,
  skip: number,
  limit: number,
  query: string = "",
  filter: any = {}
) => {
  return axios.post(
    `${API_BASE_URL}community/members/${id}`,
    {
      filter,
      query,
      skip,
      limit,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const getMemberDetails = (userId: string) => {
  return client.get(`/user/${userId}`);
};

export const searchUser = (phone) => {
  return client.post(`/user/search`, {
    query: phone,
    filter: {},
    limit: 1,
    offset: 0,
  });
};

export const createUser = (input) => {
  return client.post(`/user/new`, {
    ...input,
  });
};

export const addToCommunity = (communityId, userId) => {
  return client.post(`/community/join/${communityId}`, {
    userId,
  });
};

export const createRelation = (userId, relativeId, relationshipType) => {
  return client.post(`/relationship/relation/new`, {
    userId,
    relativeId,
    type: relationshipType,
  });
};

export const createReverseRelation = (userId, relativeId, relationshipType) => {
  return client.post(`/relationship/relation/new`, {
    userId: relativeId,
    relativeId: userId,
    type: relationshipType,
  });
};

export const createRelative = (input) => {
  return client.post(`/relationship/relative/new`, {
    ...input,
  });
};

export const updateAddress = (id: string, input: any) => {
  return client.put(`/address/${id}`, input);
};

export const updateBusiness = (id: string, input: any) => {
  return client.put(`/business/${id}`, input);
};

export const createBusiness = (input: any) => {
  return client.post(`/business/new`, input);
};

export const getAllTodaysBirthdays = (communityId: string) => {
  return client.get(`/user/events/${communityId}`);
};

export const wishBirthday = (
  to?: string,
  from?: string,
  communityId?: string
) => {
  return client.post(`/user/event/wishBirthday`, {
    to,
    from,
    communityId,
  });
};
