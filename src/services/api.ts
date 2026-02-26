import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://nexaproapi.quantumvision-tech.com/api/v1";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post<{ access: string }>(
            `${API_BASE}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            },
          );
          const { access } = response.data;
          localStorage.setItem("access_token", access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        } else {
          // No refresh token available - session expired
          handleSessionExpired();
        }
      } catch (refreshError) {
        // Refresh token is invalid or expired
        handleSessionExpired();
      }
    }

    return Promise.reject(error);
  },
);

// Handle session expiration with user notification
function handleSessionExpired() {
  // Clear all auth data
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Show notification to user
  const message = "Your session has expired. Please log in again.";

  // Try to show toast notification if available
  if (typeof window !== "undefined") {
    // Create a temporary toast element
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Redirect after showing message
    setTimeout(() => {
      document.body.removeChild(toast);
      window.location.href = "/auth/login";
    }, 2000);
  } else {
    // Fallback: immediate redirect
    window.location.href = "/auth/login";
  }
}

export const authAPI = {
  login: (username: string, password: string) =>
    apiClient.post<{ access: string; refresh: string }>("/auth/token/", {
      username,
      password,
    }),
  refresh: (refreshToken: string) =>
    apiClient.post<{ access: string }>("/auth/token/refresh/", {
      refresh: refreshToken,
    }),
  verify: (token: string) => apiClient.post("/auth/token/verify/", { token }),
};

export const ownersAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/owners/", { params }),
  get: (id: string | number) => apiClient.get(`/owners/${id}/`),
  create: (data: Record<string, unknown>) => apiClient.post("/owners/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/owners/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/owners/${id}/`, data),
  uploadSignature: (id: string | number, formData: FormData) =>
    apiClient.patch(`/owners/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string | number) => apiClient.delete(`/owners/${id}/`),
};

export const locationsAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/locations/", { params }),
  get: (id: string | number) => apiClient.get(`/locations/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiClient.post("/locations/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/locations/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/locations/${id}/`, data),
  delete: (id: string | number) => apiClient.delete(`/locations/${id}/`),
};

export const propertiesAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/properties/", { params }),
  get: (id: string | number) => apiClient.get(`/properties/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiClient.post("/properties/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/properties/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/properties/${id}/`, data),
  delete: (id: string | number) => apiClient.delete(`/properties/${id}/`),
};

export const unitsAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/units/", { params }),
  get: (id: string | number) => apiClient.get(`/units/${id}/`),
  create: (data: Record<string, unknown>) => apiClient.post("/units/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/units/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/units/${id}/`, data),
  delete: (id: string | number) => apiClient.delete(`/units/${id}/`),
};

export const tenantsAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/tenants/", { params }),
  get: (id: string | number) => apiClient.get(`/tenants/${id}/`),
  create: (data: Record<string, unknown>) => apiClient.post("/tenants/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/tenants/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/tenants/${id}/`, data),
  uploadSignature: (id: string | number, formData: FormData) =>
    apiClient.patch(`/tenants/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string | number) => apiClient.delete(`/tenants/${id}/`),
};

export const tenanciesAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/tenancies/", { params }),
  get: (id: string | number) => apiClient.get(`/tenancies/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiClient.post("/tenancies/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/tenancies/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/tenancies/${id}/`, data),
  delete: (id: string | number) => apiClient.delete(`/tenancies/${id}/`),
  moveOut: (id: string | number, moveOutDate: string) =>
    apiClient.put(`/tenancies/${id}/move-out/`, { move_out_date: moveOutDate }),
  generateContract: (id: string | number) =>
    apiClient.get(`/tenancies/${id}/generate-contract/`),
  sendReminder: (id: string | number) =>
    apiClient.post(`/tenancies/${id}/send-reminder/`),
};

export const billingAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/bills/", { params }),
  get: (id: string | number) => apiClient.get(`/bills/${id}/`),
  create: (data: Record<string, unknown>) => apiClient.post("/bills/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/bills/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/bills/${id}/`, data),
  delete: (id: string | number) => apiClient.delete(`/bills/${id}/`),
  generate: (billingPeriod: string, dueDay = 5) =>
    apiClient.post("/bills/generate/", {
      billing_period: billingPeriod,
      due_day: dueDay,
    }),
  markOverdue: () => apiClient.post("/bills/mark-overdue/"),
};

export const paymentsAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/payments/", { params }),
  get: (id: string | number) => apiClient.get(`/payments/${id}/`),
  create: (data: Record<string, unknown>) => apiClient.post("/payments/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/payments/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/payments/${id}/`, data),
  delete: (id: string | number) => apiClient.delete(`/payments/${id}/`),
};

export const notificationsAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/notifications/", { params }),
  get: (id: string | number) => apiClient.get(`/notifications/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiClient.post("/notifications/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/notifications/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/notifications/${id}/`, data),
  delete: (id: string | number) => apiClient.delete(`/notifications/${id}/`),
};

export const profilesAPI = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get("/profiles/", { params }),
  get: () => apiClient.get(`/profiles/`),
  create: (data: Record<string, unknown>) => apiClient.post("/profiles/", data),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/profiles/${id}/`, data),
  patch: (id: string | number, data: Record<string, unknown>) =>
    apiClient.patch(`/profiles/${id}/`, data),
  delete: (id: string | number) => apiClient.delete(`/profiles/${id}/`),
  updateOwner: (ownerId: string | number, data: Record<string, unknown>) =>
    apiClient.put(`/profiles/update-owner/${ownerId}/`, data),
  updateAvatar: (formData: FormData) =>
    apiClient.patch("/auth/profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default apiClient;
