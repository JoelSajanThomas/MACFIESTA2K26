import { create } from "zustand";
import { api } from "./api";
import { getFestivalSettings } from "./festivalStore";
import { User, Registration } from "@/types";
import { hashPassword } from "../utils/crypto";


interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  registrations: Registration[];
  isInitialized: boolean;

  initialize: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLogin: (email: string, password: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (fields: Record<string, unknown>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  fetchRegistrations: () => Promise<void>;
  registerForEvent: (eventId: string, paymentData?: { paymentId?: string; paymentMethod?: string; amount?: number }) => Promise<{ success: boolean; message?: string; registration?: any; txId?: string }>;
  cancelRegistration: (registrationId: string) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  registrations: [],
  isInitialized: false,

  initialize: () => {
    if (typeof window !== "undefined") {
      // Sync logout across tabs
      const syncLogout = (event: StorageEvent) => {
        if (event.key === "macfiesta_token" && !event.newValue) {
          get().logout();
        }
      };
      window.removeEventListener("storage", syncLogout);
      window.addEventListener("storage", syncLogout);

      const storedToken = sessionStorage.getItem("macfiesta_token");
      const storedUser = sessionStorage.getItem("macfiesta_user");
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          set({
            token: storedToken,
            user: parsedUser,
            isInitialized: true,
          });
          // Background updates
          get().fetchProfile();
          get().fetchRegistrations();
        } catch (e) {
          console.error("Error parsing stored user data from sessionStorage", e);
          sessionStorage.removeItem("macfiesta_token");
          sessionStorage.removeItem("macfiesta_user");
          set({ token: null, user: null, isInitialized: true });
        }
      } else {
        set({ isInitialized: true });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const hashedPassword = await hashPassword(password);
      const response = await api.post("/auth/login", { email, password: hashedPassword });
      const { token, user } = response.data;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("macfiesta_token", token);
        sessionStorage.setItem("macfiesta_user", JSON.stringify(user));
      }

      set({ token, user, isLoading: false });

      // Fetch registrations
      await get().fetchRegistrations();

      return { success: true };
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to log in. Check credentials.";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  adminLogin: async (email, password, otp) => {
    set({ isLoading: true, error: null });
    try {
      const hashedPassword = await hashPassword(password);
      const response = await api.post("/admin/login", { email, password: hashedPassword, otp });
      const { token, user } = response.data;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("macfiesta_token", token);
        sessionStorage.setItem("macfiesta_user", JSON.stringify(user));
      }

      set({ token, user, isLoading: false });

      return { success: true };
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to log in. Check credentials.";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  registerUser: async (fields) => {
    if (!getFestivalSettings().registrationOpen) {
      return { success: false, message: "Registration has been officially closed by S.H.I.E.L.D. Admin Command." };
    }
    set({ isLoading: true, error: null });
    try {
      const payload: Record<string, unknown> = { ...fields };
      if (typeof payload.password === "string") {
        payload.password = await hashPassword(payload.password);
      }
      if (typeof payload.password_confirm === "string") {
        payload.password_confirm = await hashPassword(payload.password_confirm);
      }
      const response = await api.post("/auth/register", payload);
      const { token, user } = response.data;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("macfiesta_token", token);
        sessionStorage.setItem("macfiesta_user", JSON.stringify(user));
      }

      set({ token, user, isLoading: false });
      return { success: true };
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Registration failed. Try again.";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },


  logout: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("macfiesta_token");
      sessionStorage.removeItem("macfiesta_user");
      localStorage.removeItem("macfiesta_active_page");
      sessionStorage.clear();
      document.cookie = "macfiesta_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "macfiesta_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      set({ token: null, user: null, registrations: [] });
      window.location.href = "/";
    } else {

      set({ token: null, user: null, registrations: [] });
    }
  },

  fetchProfile: async () => {
    try {
      const response = await api.get("/auth/me");
      const { user } = response.data;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("macfiesta_user", JSON.stringify(user));
      }
      set({ user });
    } catch (err: any) {
      const status = err?.response?.status;
      // 404 = user deleted from DB, 401 = token expired/invalid → clear stale session
      if (status === 404 || status === 401 || status === 403) {
        console.warn("Session invalid or user not found — clearing stale session.");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("macfiesta_token");
          sessionStorage.removeItem("macfiesta_user");
        }
        set({ token: null, user: null });
      } else {
        console.error("Failed to fetch profile", err);
      }
    }
  },

  fetchRegistrations: async () => {
    try {
      const response = await api.get("/registrations/my");
      set({ registrations: response.data.registrations });
    } catch (err) {
      console.error("Failed to fetch user registrations", err);
    }
  },

  registerForEvent: async (eventId, paymentData) => {
    if (!getFestivalSettings().registrationOpen) {
      return { success: false, message: "Registration has been officially closed by S.H.I.E.L.D. Admin Command." };
    }
    try {
      const response = await api.post("/registrations", {
        eventId,
        paymentCompleted: true,
        paymentId: paymentData?.paymentId || `TXN_${Math.floor(10000000 + Math.random() * 90000000)}`,
        paymentMethod: paymentData?.paymentMethod || "UPI",
        amount: paymentData?.amount || 250
      });
      if (response.data.success) {
        await get().fetchRegistrations();
        await get().fetchProfile();
        return { success: true, registration: response.data.registration, txId: response.data.txId };
      }
      return { success: false, message: response.data.message || "Failed to register" };
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Registration error. Try again.";
      return { success: false, message };
    }
  },


  cancelRegistration: async (registrationId) => {
    try {
      const response = await api.post(`/registrations/${registrationId}/cancel`);
      if (response.data.success) {
        await get().fetchRegistrations();
        await get().fetchProfile();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || "Failed to cancel registration" };
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Cancellation failed. Try again.";
      return { success: false, message };
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/forgot-password", { email });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to process request. Try again.";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/reset-password", { token, password });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to reset password. Link may be expired.";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
}));
