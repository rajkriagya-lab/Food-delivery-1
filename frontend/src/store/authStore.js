import { create } from "zustand";
import axiosInstance from "../Api/axios";
import toast from "react-hot-toast";

const getRedirectPath = (role) => {
    switch (role) {
        case "ADMIN":
            return "/admin/dashboard";
        case "RESTURANT_OWNER":
            return "/restaurant/dashboard";
        case "CUSTOMER":
            return "/";
        default:
            return "/";
    }
};

export const useAuthStore = create((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    register: async (formData, navigate) => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.post("/auth/register", formData);

            if (data?.success) {
                toast.success(data.message || "Account created successfully!");
                if (navigate) navigate("/login");
            } else {
                toast.error(data?.message || "Registration failed");
            }
        } catch (error) {
            const message = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(message);
        } finally {
            set({ loading: false });
        }
    },

    login: async (formData, navigate) => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.post("/auth/login", formData);

            if (data?.success) {
                set({ user: data.user });

                if (data.token) {
                    localStorage.setItem("token", data.token);
                }

                toast.success(data.message || "Login successful!");

                const redirectPath = getRedirectPath(data.user?.role);
                if (navigate) navigate(redirectPath);
            } else {
                toast.error(data?.message || "Invalid credentials!");
            }
        } catch (error) {
            const message = error.response?.data?.message || "Invalid email or password";
            toast.error(message);
        } finally {
            set({ loading: false });
        }
    },

    // LOGOUT ACTION
    logout: async (navigate) => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            localStorage.removeItem("token");
            set({ user: null });
            toast.success("Logged out successfully");
            if (navigate) navigate("/login");
        }
    },

    checkAuth: async () => {
        try {
            set({ checkingAuth: true });
            const { data } = await axiosInstance.get("/auth/me");

            if (data?.success && data?.user) {
                set({ user: data.user });
            } else {
                set({ user: null });
            }
        } catch {
            set({ user: null });
        } finally {
            set({ checkingAuth: false });
        }
    },
}));
