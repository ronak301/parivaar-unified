import axios from "axios";

export const API_BASE_URL = "https://api.parivaarapp.in/";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((request) => request);

client.interceptors.response.use((response) => response);

export default client;
