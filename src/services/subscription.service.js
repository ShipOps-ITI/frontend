import api from "../api/axios.js";

export const getSubscription = async () => (await api.get("/api/subscription")).data;
export const activateFreePlan = async () => (await api.post("/api/subscription/free")).data;
export const startPremiumCheckout = async (billingData) => (await api.post("/api/subscription/premium/checkout", billingData)).data;
export const cancelSubscription = async () => (await api.post("/api/subscription/cancel")).data;
