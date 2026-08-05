import client from "./baseApiClient";

export const sendOtp = (number: string) => {
  return client.post(`/user/sendOtp`, {
    number,
  });
};

export const verifyOtp = (number: string, otp: string) => {
  return client.post(`/user/verifyOtp`, {
    number,
    otp,
  });
};

export const updateUser = (id: string, input: any) => {
  return client.put(`/user/${id}`, input);
};

export const deleteUser = (id: string) => {
  return client.delete(`/user/delete/${id}`);
};
