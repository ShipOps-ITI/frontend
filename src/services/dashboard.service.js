import axios from "axios";

const dashboardAPI = axios.create({
  baseURL: "http://localhost:5003",
});

export const getStatistics = () => {
  return dashboardAPI.get("/dashboard/statistics");
};
