import axios from "axios";
import getEnv from "../runtimeEnv";
import { showToast } from "../components/Toast/toast";

const api = axios.create({
    baseURL: getEnv("VITE_AUTH_URL") || "/auth",
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
    (response) => {
        // Authentication requests include login, logout, token refresh, onboarding,
        // and payment flows. They must not create generic CRUD success notifications.
        // Feature services show a toast only for their own create/update/delete actions.
        return response;
    },
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
                const refreshUrl = (getEnv("VITE_AUTH_URL") || "/auth").replace(/\/+$/, "") + "/refresh";
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

        if (error.response?.status !== 401) showToast(error.response?.data?.message || error.response?.data?.error || "The operation could not be completed.", "error");
        return Promise.reject(error);
    }
);

export default api;
