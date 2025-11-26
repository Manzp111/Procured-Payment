
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await axios.post(`${apiUrl}/user/refresh/`, { refresh: refreshToken });
    const newAccessToken = res.data.data.access;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch {
    // Refresh failed → logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    return null;
  }
};
