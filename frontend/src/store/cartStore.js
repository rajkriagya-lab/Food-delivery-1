import { create } from "zustand";
import axiosInstance from "../Api/axios.js";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    cart: null,
    loading: false,

    fetchCart: async () => {
        set({ loading: true });
        try {
            const { data } = await axiosInstance.get("/cart");
            if (data.success) {
                set({ cart: data.cart });
            }
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            set({ loading: false });
        }
    },

    addToCart: async (foodId, quantity = 1) => {
        try {
            const { data } = await axiosInstance.post("/cart/add", {
                foodId,
                quantity,
            });
            if (data.success) {
                toast.success(data.message || "Food added to cart");
                get().fetchCart();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add food to cart");
        }
    },

    updateQuantity: async (itemId, quantity) => {
        try {
            const { data } = await axiosInstance.put(`/cart/update/${itemId}`, {
                quantity,
            });
            if (data.success) {
                get().fetchCart();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update quantity");
        }
    },

    removeFromCart: async (itemId) => {
        try {
            const { data } = await axiosInstance.delete(`/cart/remove/${itemId}`);
            if (data.success) {
                toast.success(data.message || "Item removed from cart");
                get().fetchCart();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to remove item");
        }
    },

    clearCart: () => set({ cart: null }),
}));