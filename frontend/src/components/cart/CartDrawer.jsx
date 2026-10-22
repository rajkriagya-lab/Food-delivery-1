import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../Api/axios";

const formatMoney = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-NP")}`;

export default function CartDrawer({ open, onClose, user }) {
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const loadCart = useCallback(async () => {
        if (!user || user.role !== "CUSTOMER") {
            setCart({ items: [], totalAmount: 0 });
            return;
        }
        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/cart");
            setCart({ items: data.items || [], totalAmount: Number(data.totalAmount || 0) });
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load your cart.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!open) return undefined;
        const refreshId = window.setTimeout(() => { void loadCart(); }, 0);
        return () => window.clearTimeout(refreshId);
    }, [open, loadCart]);

    useEffect(() => {
        if (!open) return undefined;
        const refresh = () => void loadCart();
        window.addEventListener("cart:updated", refresh);
        return () => window.removeEventListener("cart:updated", refresh);
    }, [open, loadCart]);

    useEffect(() => {
        if (!open) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const keydown = (event) => { if (event.key === "Escape") onClose(); };
        window.addEventListener("keydown", keydown);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", keydown);
        };
    }, [open, onClose]);

    const updateItem = async (item, quantity) => {
        setUpdatingId(item.id);
        try {
            if (quantity <= 0) await axiosInstance.delete(`/cart/remove/${item.id}`);
            else await axiosInstance.put(`/cart/update/${item.id}`, { quantity });
            await loadCart();
            window.dispatchEvent(new Event("cart:updated"));
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update this item.");
        } finally {
            setUpdatingId(null);
        }
    };

    if (!open) return null;
    const items = cart.items || [];
    const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const deliveryFee = items.length ? 100 : 0;
    const serviceFee = 0;

    return <div className="fixed inset-0 z-[80]">
        <button type="button" aria-label="Close cart" onClick={onClose} className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
        <aside role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" className="freshbite-cart-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white text-slate-900 shadow-2xl animate-[slide-in-right_220ms_ease-out]">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">Your basket</p><h2 id="cart-drawer-title" className="mt-0.5 text-xl font-black">Cart <span className="text-sm font-semibold text-slate-400">({itemCount})</span></h2></div>
                <button type="button" onClick={onClose} aria-label="Close cart" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"><X size={19} /></button>
            </header>

            {!user ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><ShoppingBag size={35} className="text-slate-300" /><h3 className="mt-4 text-lg font-bold">Sign in to see your cart</h3><p className="mt-2 text-sm text-slate-500">Your basket is linked to your customer account.</p><Link to="/login" onClick={onClose} className="mt-5 rounded-xl bg-[#ff4b3e] px-5 py-3 text-sm font-bold text-white">Log in</Link></div>
                : loading ? <div className="flex flex-1 flex-col gap-4 p-5">{[1, 2, 3].map((item) => <div key={item} className="flex animate-pulse gap-3"><div className="h-16 w-16 rounded-xl bg-slate-100" /><div className="flex-1"><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="mt-3 h-3 w-1/3 rounded bg-slate-100" /></div></div>)}</div>
                    : items.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><ShoppingBag size={35} className="text-slate-300" /><h3 className="mt-4 text-lg font-bold">Your cart is waiting</h3><p className="mt-2 text-sm text-slate-500">Add something tasty and it will show up here.</p><button type="button" onClick={onClose} className="mt-5 rounded-xl bg-[#fff1ed] px-5 py-3 text-sm font-bold text-[#e83d32]">Explore the menu</button></div>
                        : <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                            {items.map((item) => {
                                const food = item.food || {};
                                return <article key={item.id} className={`flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 ${updatingId === item.id ? "opacity-60" : ""}`}>
                                    <img src={food.image || "/placeholder-food.png"} alt={food.name || "Food item"} className="h-16 w-16 rounded-xl object-cover" />
                                    <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-bold">{food.name || "Menu item"}</h3><p className="mt-1 text-xs text-slate-500">{food.restaurant?.name || "Restaurant"}</p></div><span className="shrink-0 text-sm font-extrabold text-emerald-700">{formatMoney(Number(food.price || 0) * item.quantity)}</span></div>
                                        <div className="mt-3 flex items-center justify-between"><div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1"><button type="button" disabled={updatingId === item.id} onClick={() => void updateItem(item, item.quantity - 1)} aria-label={`Decrease ${food.name} quantity`} className="grid h-7 w-7 place-items-center rounded-md text-slate-600 hover:bg-slate-100"><Minus size={14} /></button><span className="min-w-5 text-center text-xs font-bold">{item.quantity}</span><button type="button" disabled={updatingId === item.id} onClick={() => void updateItem(item, item.quantity + 1)} aria-label={`Increase ${food.name} quantity`} className="grid h-7 w-7 place-items-center rounded-md text-slate-600 hover:bg-slate-100"><Plus size={14} /></button></div><button type="button" onClick={() => void updateItem(item, 0)} aria-label={`Remove ${food.name}`} className="p-2 text-slate-400 transition hover:text-rose-500"><Trash2 size={15} /></button></div>
                                    </div>
                                </article>;
                            })}
                        </div>}

            {user && items.length > 0 && !loading && <footer className="border-t border-slate-100 bg-white p-5 sm:p-6">
                <div className="mb-4 space-y-2 text-sm"><div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatMoney(cart.totalAmount)}</span></div><div className="flex justify-between text-slate-600"><span>Delivery fee</span><span>{formatMoney(deliveryFee)}</span></div><div className="flex justify-between text-slate-600"><span>Service fee</span><span>{serviceFee ? formatMoney(serviceFee) : "No service fee"}</span></div><div className="flex justify-between border-t border-slate-100 pt-3 text-base font-extrabold text-slate-900"><span>Total</span><span>{formatMoney(cart.totalAmount + deliveryFee + serviceFee)}</span></div></div>
                <p className="mb-4 text-xs text-slate-400">Delivery fee is confirmed at checkout. Add a coupon in your cart to apply an available discount.</p>
                <Link to="/checkout" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl bg-[#ff4b3e] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e83d32]">Proceed to checkout <ArrowRight size={16} /></Link>
                <Link to="/cart" onClick={onClose} className="mt-2 block text-center text-xs font-semibold text-slate-500 transition hover:text-slate-900">View full cart</Link>
            </footer>}
        </aside>
    </div>;
}
