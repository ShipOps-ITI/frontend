import api from "../api/axios.js";

export const register = async (data) => {
    const response = await api.post("/register", data);
    return response.data;
};

export const login = async (data) => {
    const response = await api.post("/login", data);
    const { accessToken, user } = response.data;
    
    // Store access token locally
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    
    return response.data;
};

export const completeCompanyOnboarding = async (companyId) => {
    const response = await api.post("/onboarding/company", { companyId });
    const { accessToken, user } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    return response.data;
};

export const logout = async () => {
    try {
        await api.post("/logout");
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        // Clear local storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
    }
};

export const refreshToken = async () => {
    try {
        const response = await api.post("/refresh");
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        return accessToken;
    } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw error;
    }
};

export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("accessToken");
};
