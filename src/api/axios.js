import axios from "axios";
import { getRuntimeEnv } from "../config/runtimeEnv";

const api = axios.create({
    baseURL: getRuntimeEnv("VITE_AUTH_URL", "http://localhost:5001"),
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const authEndpoints = ["/login", "/register", "/refresh"];
        const isAuthRequest = authEndpoints.some((endpoint) =>
            originalRequest?.url?.endsWith(endpoint)
        );

        if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshUrl = getRuntimeEnv("VITE_AUTH_URL", "http://localhost:5001").replace(/\/+$/, "") + "/refresh";
                const response = await axios.post(
                    refreshUrl,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data;
                localStorage.setItem("accessToken", accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
