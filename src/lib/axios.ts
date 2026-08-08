import axios, { AxiosError, AxiosResponse } from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Response interceptor: returns response.data directly and handles errors cleanly
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError<{ message?: string }>) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected server error occurred.";

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
