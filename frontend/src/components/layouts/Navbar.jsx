import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, MapPin, Menu, Search, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import CartDrawer from "../cart/CartDrawer";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../Api/axios";

const addressStorageKey = "khaana-delivery-address";
const readAddress = () => {
    try { return JSON.parse(localStorage.getItem(addressStorageKey) || "null"); } catch { return null; }
};

export default function Navbar() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);
    const [search, setSearch] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [address, setAddress] = useState(readAddress);
    const [addressOpen, setAddressOpen] = useState(false);
    const [addressDraft, setAddressDraft] = useState({ street: "", city: address?.city || "" });
    const [savedAddresses, setSavedAddresses] = useState([]);

    const loadCartSummary = useCallback(async () => {
        if (!user || user.role !== "CUSTOMER") {
            setCartCount(0);
            setCartTotal(0);
            return;
        }
        try {
            const { data } = await axiosInstance.get("/cart");
            setCartCount((data.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0));
            setCartTotal(Number(data.totalAmount || 0));
        } catch {
            setCartCount(0);
            setCartTotal(0);
        }
    }, [user]);

    useEffect(() => {
        const refreshId = window.setTimeout(() => { void loadCartSummary(); }, 0);
        return () => window.clearTimeout(refreshId);
    }, [loadCartSummary, location.pathname]);

    useEffect(() => {
        const refresh = () => void loadCartSummary();
        window.addEventListener("cart:updated", refresh);
        return () => window.removeEventListener("cart:updated", refresh);
    }, [loadCartSummary]);

    useEffect(() => {
        const onKeyDown = (event) => {
            const target = event.target;
            const isTyping = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
            if ((event.key === "/" && !isTyping) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
                event.preventDefault();
                searchRef.current?.focus();
            }
            if (event.key === "Escape") {
                setAddressOpen(false);
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const openAddressPicker = async () => {
        setAddressOpen((open) => !open);
        setAddressDraft({ street: address?.street || "", city: address?.city || "" });
        if (user?.role === "CUSTOMER") {
            try {
                const { data } = await axiosInstance.get("/address/my");
                setSavedAddresses(data.addresses || []);
            } catch {
                setSavedAddresses([]);
            }
        }
    };

    const selectAddress = (selected) => {
        const next = { id: selected.id, street: selected.street, city: selected.city };
        setAddress(next);
        localStorage.setItem(addressStorageKey, JSON.stringify(next));
        setAddressOpen(false);
    };

    const saveAddress = (event) => {
        event.preventDefault();
        const next = { street: addressDraft.street.trim(), city: addressDraft.city.trim() };
        if (!next.street || !next.city) return;
        setAddress(next);
        localStorage.setItem(addressStorageKey, JSON.stringify(next));
        setAddressOpen(false);
    };

    const submitSearch = (event) => {
        event.preventDefault();
        if (!search.trim()) return;
        setMobileMenuOpen(false);
        navigate(`/restaurant?keyword=${encodeURIComponent(search.trim())}`);
    };

    const navLinks = [
        { label: "Restaurants", to: "/restaurant" },
        { label: "Cuisines", to: "/cuisines" },
        { label: "Offers", to: "/offers" },
    ];

    return <>
        <header className="freshbite-header sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-5 lg:px-8">
                <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="FreshBite home"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ff4b3e] text-white shadow-sm"><UtensilsCrossed size={20} /></span><span className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">Fresh<span className="text-[#ff4b3e]">Bite</span></span></Link>

                <div className="relative order-3 w-full shrink-0 lg:order-none lg:w-auto">
                    <button type="button" onClick={() => void openAddressPicker()} aria-expanded={addressOpen} aria-haspopup="dialog" className="flex max-w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50 sm:px-3"><MapPin size={18} className="shrink-0 text-[#ff4b3e]" /><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Deliver to</span><span className="block max-w-44 truncate text-xs font-bold text-slate-800">{address?.city || "Choose your location"}</span></span><ChevronDown size={14} className="text-slate-400" /></button>
                    {addressOpen && <><button type="button" aria-label="Close address picker" className="fixed inset-0 z-40 cursor-default" onClick={() => setAddressOpen(false)} /><div role="dialog" aria-label="Choose delivery address" className="absolute left-0 top-full z-50 mt-2 w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"><div className="flex items-start justify-between"><div><h2 className="text-sm font-extrabold text-slate-900">Delivery address</h2><p className="mt-1 text-xs text-slate-500">Choose a saved address or add a delivery area.</p></div><button onClick={() => setAddressOpen(false)} aria-label="Close" className="text-slate-400 hover:text-slate-700"><X size={17} /></button></div>
                        {savedAddresses.length > 0 && <div className="mt-3 max-h-36 space-y-1 overflow-auto">{savedAddresses.map((saved) => <button key={saved.id} type="button" onClick={() => selectAddress(saved)} className="w-full rounded-xl p-2.5 text-left transition hover:bg-slate-50"><span className="block text-xs font-bold text-slate-800">{saved.street}</span><span className="text-xs text-slate-500">{saved.city}</span></button>)}</div>}
                        <form onSubmit={saveAddress} className="mt-3 space-y-2 border-t border-slate-100 pt-3"><label className="block text-xs font-semibold text-slate-600">Street or neighborhood<input required value={addressDraft.street} onChange={(event) => setAddressDraft({ ...addressDraft, street: event.target.value })} placeholder="e.g. Lazimpat, Ward 2" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-400" /></label><label className="block text-xs font-semibold text-slate-600">City<input required value={addressDraft.city} onChange={(event) => setAddressDraft({ ...addressDraft, city: event.target.value })} placeholder="e.g. Kathmandu" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-400" /></label><button className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">Use this address</button></form><p className="mt-2 text-[10px] leading-4 text-slate-400">New locations are saved on this device. Signed-in users can choose an address from their account.</p></div></>}
                </div>

                <form onSubmit={submitSearch} className="order-4 flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-400 focus-within:bg-white lg:order-none"><Search size={17} className="shrink-0 text-slate-400" /><label className="sr-only" htmlFor="header-search">Search food and restaurants</label><input ref={searchRef} id="header-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search food, restaurants..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" /><kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 md:inline">/</kbd></form>

                <nav className="hidden shrink-0 items-center gap-4 xl:flex">{navLinks.map((link) => <Link key={link.to} to={link.to} className={`text-xs font-semibold transition hover:text-[#ff4b3e] ${location.pathname.startsWith(link.to) ? "text-[#ff4b3e]" : "text-slate-600"}`}>{link.label}</Link>)}</nav>

                <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
                    <ThemeToggle className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50" />
                    {user ? <button type="button" onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 rounded-xl bg-[#ff4b3e] px-3 py-2.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e83d32]" aria-label={`Open cart with ${cartCount} items`}><ShoppingBag size={18} /><span className="hidden text-xs font-bold sm:inline">Cart</span><span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-emerald-500 px-1 text-[10px] font-black text-white">{cartCount}</span><span className="hidden border-l border-white/30 pl-2 text-xs font-bold sm:inline">Rs. {cartTotal.toLocaleString("en-NP")}</span></button> : <Link to="/login" className="flex items-center gap-2 rounded-xl bg-[#ff4b3e] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#e83d32]"><ShoppingBag size={17} /><span>Cart</span></Link>}
                    {!user ? <Link to="/login" className="hidden rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex">Log in</Link> : <Link to="/profile" aria-label="My profile" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex">Profile</Link>}
                    {user && <button type="button" onClick={() => void logout(navigate)} title="Log out" aria-label="Log out" className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 sm:inline-flex"><LogOut size={16} /><span className="hidden md:inline">Log out</span></button>}
                    <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 xl:hidden"><Menu size={19} /></button>
                </div>
            </div>
            {mobileMenuOpen && <nav className="border-t border-slate-100 bg-white px-4 py-3 shadow-sm xl:hidden">{navLinks.map((link) => <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{link.label}</Link>)}{user && <><Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">My orders</Link><button type="button" onClick={() => { setMobileMenuOpen(false); logout(navigate); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Log out</button></>}</nav>}
        </header>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} user={user} />
    </>;
}
