import { create } from "zustand";
import axiosInstance from "../Api/axios";
import toast from "react-hot-toast";

const getRedirectPath = (role) => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "RESTURANT_OWNER") return "/restaurant/dashboard";
    return "/";
}

export const useAuthStore = create((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    register: async (formData, navigate) => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.post("/auth/register", formData);
            if (data.success) {
                toast.success(data.message || "Account Created!!");
                navigate("/login");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Register failed");
        } finally {
            set({ loading: false });
        }
    },

    login: async (formData, navigate) => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.post("/auth/login", formData);
            if (data.success) {
                set({ user: data.user });
                toast.success(data.message || "Login Successfully!");
                navigate(getRedirectPath(data.user.role));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ loading: false });
        }
    },

    logout: async (navigate) => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ user: null });
            toast.success("Logout Successfully");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout Failed");
        }
    },

    checkAuth: async () => {
        try {
            const { data } = await axiosInstance.get("/auth/me");
            if (data.success) {
                set({ user: data.user });
            }
        } catch (error) {
            set({ user: null });
        } finally{
            set({checkingAuth: false});
        }
    },
}));