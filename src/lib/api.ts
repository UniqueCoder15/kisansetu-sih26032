import {
  MOCK_MANDI_CENTRES,
  MOCK_TIME_SLOTS,
  MOCK_ACTIVE_FARMER_BOOKING,
  MOCK_OPERATOR_QUEUE,
} from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kisansetu_token");
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("kisansetu_token", token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("kisansetu_token");
  }
};

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<{ success: boolean; data: T; error?: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    return {
      success: true,
      data: result.data as T,
    };
  } catch (err: any) {
    console.warn(`[KisanSetu API] Request to ${endpoint} failed: ${err.message}. Using fallback if available.`);
    if (fallbackData !== undefined) {
      return {
        success: true,
        data: fallbackData,
      };
    }
    return {
      success: false,
      data: null as unknown as T,
      error: err.message || "Network error",
    };
  }
}

export const api = {
  auth: {
    login: async (phone: string, password: string) => {
      const res = await apiFetch<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },
    register: async (userData: any) => {
      const res = await apiFetch<any>("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },
    getMe: async () => {
      return await apiFetch<any>("/auth/me");
    },
  },

  centres: {
    getAll: async (district?: string) => {
      const endpoint = district ? `/centres?district=${encodeURIComponent(district)}` : "/centres";
      return await apiFetch<any>(
        endpoint,
        { method: "GET" },
        { centres: MOCK_MANDI_CENTRES }
      );
    },
    getById: async (id: string) => {
      return await apiFetch<any>(
        `/centres/${id}`,
        { method: "GET" },
        { centre: MOCK_MANDI_CENTRES[0] }
      );
    },
  },

  farmers: {
    getProfile: async () => {
      return await apiFetch<any>(
        "/farmers/me",
        { method: "GET" },
        { profile: MOCK_ACTIVE_FARMER_BOOKING }
      );
    },
    updateProfile: async (updateData: any) => {
      return await apiFetch<any>("/farmers/me", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
    },
  },

  queue: {
    bookSlot: async (bookingData: {
      procurementCentreId: string;
      cropType: string;
      quantityQuintals: number;
      vehicleNumber: string;
      bookingDate: string;
      scheduledSlot: string;
    }) => {
      return await apiFetch<any>("/queue/book", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });
    },
    getMyBookings: async () => {
      return await apiFetch<any>(
        "/queue/my-bookings",
        { method: "GET" },
        { bookings: [MOCK_ACTIVE_FARMER_BOOKING] }
      );
    },
    getBookingById: async (id: string) => {
      return await apiFetch<any>(
        `/queue/${id}`,
        { method: "GET" },
        { booking: MOCK_ACTIVE_FARMER_BOOKING }
      );
    },
    cancelBooking: async (id: string) => {
      return await apiFetch<any>(`/queue/${id}/cancel`, {
        method: "PATCH",
      });
    },
  },

  procurement: {
    logWeighing: async (data: { bookingId: string; grossWeightKg: number; tareWeightKg: number }) => {
      return await apiFetch<any>("/procurement/weighing", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    logQuality: async (data: { bookingId: string; moisturePercentage: number; grade: string; remarks?: string }) => {
      return await apiFetch<any>("/procurement/quality", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getMyProcurements: async () => {
      return await apiFetch<any>(
        "/procurement/my-procurements",
        { method: "GET" },
        { procurements: [] }
      );
    },
    getById: async (id: string) => {
      return await apiFetch<any>(`/procurement/${id}`, { method: "GET" });
    },
  },

  payments: {
    getMyPayments: async () => {
      return await apiFetch<any>(
        "/payments/me",
        { method: "GET" },
        { payments: [] }
      );
    },
    disbursePayment: async (paymentId: string) => {
      return await apiFetch<any>(`/payments/${paymentId}/disburse`, {
        method: "POST",
      });
    },
  },

  notifications: {
    getMyNotifications: async () => {
      return await apiFetch<any>(
        "/notifications",
        { method: "GET" },
        { notifications: [] }
      );
    },
    markAsRead: async (id: string) => {
      return await apiFetch<any>(`/notifications/${id}/read`, {
        method: "PATCH",
      });
    },
    markAllAsRead: async () => {
      return await apiFetch<any>("/notifications/read-all", {
        method: "PATCH",
      });
    },
  },

  admin: {
    getCentres: async () => {
      return await apiFetch<any>(
        "/admin/centres",
        { method: "GET" },
        { centres: MOCK_MANDI_CENTRES }
      );
    },
    getQueue: async (centreId?: string, status?: string) => {
      let query = "";
      if (centreId) query += `centreId=${encodeURIComponent(centreId)}&`;
      if (status) query += `status=${encodeURIComponent(status)}`;
      const endpoint = `/admin/queue${query ? "?" + query : ""}`;
      return await apiFetch<any>(
        endpoint,
        { method: "GET" },
        { queue: MOCK_OPERATOR_QUEUE }
      );
    },
    updateTokenStatus: async (id: string, status: string) => {
      return await apiFetch<any>(`/admin/queue/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    getMetrics: async () => {
      return await apiFetch<any>(
        "/admin/metrics",
        { method: "GET" },
        {
          totalCentres: 4,
          totalFarmers: 14250,
          totalBookings: 125,
          activeQueueCount: 42,
          completedProcurements: 83,
          totalCapacityQuintals: 4500,
          currentLoadQuintals: 2410,
          capacityUtilizationPercentage: 54,
        }
      );
    },
    getAuditLogs: async (limit: number = 50) => {
      return await apiFetch<any>(
        `/admin/audit-logs?limit=${limit}`,
        { method: "GET" },
        { logs: [] }
      );
    },
  },
};
