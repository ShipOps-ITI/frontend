import api from "../api/axios.js";

export const getSubscription = async () => (await api.get("/subscription")).data;
export const activateTrial = async () => (await api.post("/subscription/trial")).data;
export const startPremiumCheckout = async (billingData) => (await api.post("/subscription/premium/checkout", billingData)).data;
export const cancelSubscription = async () => (await api.post("/subscription/cancel")).data;
