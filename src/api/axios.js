import axios from "axios";
<<<<<<< HEAD
import getEnv from "../runtimeEnv";

const api = axios.create({
    baseURL: getEnv("VITE_AUTH_URL") || "/auth",
=======
import { getRuntimeEnv } from "../config/runtimeEnv";

const api = axios.create({
    baseURL: getRuntimeEnv("VITE_AUTH_URL", "http://localhost:5001"),
>>>>>>> 865c419 (feat: add company admin onboarding and improve shipment workflows)
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Send cookies with requests
});

// Add access token to every request
api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Handle 401 and refresh token
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
                // Try to refresh the token
<<<<<<< HEAD
                const refreshUrl = (getEnv("VITE_AUTH_URL") || "/auth").replace(/\/+$/, "") + "/refresh";
=======
                const refreshUrl = getRuntimeEnv("VITE_AUTH_URL", "http://localhost:5001").replace(/\/+$/, "") + "/refresh";
>>>>>>> 865c419 (feat: add company admin onboarding and improve shipment workflows)
                const response = await axios.post(
                    refreshUrl,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data;
                localStorage.setItem("accessToken", accessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - redirect to login
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
