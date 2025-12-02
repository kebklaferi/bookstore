import axios from "axios";

// Create an Axios instance
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api:any = axios.create({
    baseURL: apiUrl,
    headers: { "Content-Type": "application/json" },
});

console.log("API URL:", apiUrl);

// Request interceptor
api.interceptors.request.use((config:any) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (res:any) => res,
    (err:any) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            // Reload the page to trigger auth check in App.tsx
            window.location.href = "/";
        }
        return Promise.reject(err);
    }
);

export default api;
