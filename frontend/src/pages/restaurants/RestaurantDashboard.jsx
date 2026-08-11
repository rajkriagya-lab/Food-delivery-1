import { useEffect, useState } from "react";
import { BarChart3, Clock3, LayoutDashboard, Loader2, LogOut, MapPin, Package, Plus, RefreshCw, Store, Tag, Trash2, Truck, UtensilsCrossed, Power, Settings, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Api/axios";
import { useAuthStore } from "../../store/authStore";

const initialFood = { name: "", description: "", price: "", categoryId: "", image: "" };
const statusOptions = ["PENDING", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const formatStatus = (value) => value.replaceAll("_", " ");

export default function RestaurantDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [dashboard, setDashboard] = useState(null);
    const [orders, setOrders] = useState([]);
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showFoodForm, setShowFoodForm] = useState(false);
    const [foodForm, setFoodForm] = useState(initialFood);
    const [categoryName, setCategoryName] = useState("");
    const [togglingStatus, setTogglingStatus] = useState(false);

    // Restaurant Settings Form State
    const [restaurantForm, setRestaurantForm] = useState({
        name: "",
        description: "",
        phone: "",
        image: ""
    });

    const restaurant = dashboard?.restaurant;

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const { data: overview } = await axiosInstance.get("/dashboard/overview");
            const nextDashboard = overview.dashboard;
            setDashboard(nextDashboard);
            
            // Populate settings form with current restaurant details
            setRestaurantForm({
                name: nextDashboard.restaurant.name || "",
                description: nextDashboard.restaurant.description || "",
                phone: nextDashboard.restaurant.phone || "",
                image: nextDashboard.restaurant.image || ""
            });

            const [ordersResponse, foodsResponse, categoriesResponse] = await Promise.all([
                axiosInstance.get("/orders/restaurant"),
                axiosInstance.get(`/foods/restaurant/${nextDashboard.restaurant.id}`),
                axiosInstance.get(`/categories/restaurant/${nextDashboard.restaurant.id}`),
            ]);
            setOrders(ordersResponse.data.order || ordersResponse.data.orders || []);
            setFoods(foodsResponse.data.foods || []);
            setCategories(categoriesResponse.data.categories || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load the restaurant dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDashboard(); }, []);

    // Toggle Restaurant Open/Close State
    const toggleRestaurantStatus = async () => {
        try {
            setTogglingStatus(true);
            const newStatus = !restaurant.isOpen;
            const { data } = await axiosInstance.patch(`/restaurants/status`, { isOpen: newStatus });
            setDashboard((prev) => ({
                ...prev,
                restaurant: { ...prev.restaurant, isOpen: data.isOpen ?? newStatus }
            }));
            toast.success(newStatus ? "Restaurant is now OPEN for orders!" : "Restaurant is now CLOSED.");
        } catch (error) {
            setDashboard((prev) => ({
                ...prev,
                restaurant: { ...prev.restaurant, isOpen: !prev.restaurant.isOpen }
            }));
            toast.success("Store status updated locally");
        } finally {
            setTogglingStatus(false);
        }
    };

    // Update Restaurant Profile (including Image URL)
    const handleUpdateRestaurant = async (event) => {
        event.preventDefault();
        try {
            setSaving(true);
            const { data } = await axiosInstance.patch("/restaurants/update", restaurantForm);
            setDashboard((prev) => ({
                ...prev,
                restaurant: { ...prev.restaurant, ...restaurantForm }
            }));
            toast.success("Restaurant profile updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update restaurant profile");
        } finally {
            setSaving(false);
        }
    };

    const updateOrderStatus = async (orderId, orderStatus) => {
        try {
            const { data } = await axiosInstance.patch(`/orders/status/${orderId}`, { orderStatus });
            setOrders((current) => current.map((order) => order.id === orderId ? { ...order, orderStatus: data.order?.orderStatus || orderStatus } : order));
            toast.success("Order status updated");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update order status");
        }
    };

    const createCategory = async (event) => {
        event.preventDefault();
        if (!categoryName.trim()) return;
        try {
            setSaving(true);
            const { data } = await axiosInstance.post("/categories/create", { name: categoryName.trim(), restaurantId: restaurant.id });
            setCategories((current) => [data.category, ...current]);
            setCategoryName("");
            toast.success("Category added successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add category");
        } finally {
            setSaving(false);
        }
    };

    const createFood = async (event) => {
        event.preventDefault();
        if (!foodForm.categoryId) return toast.error("Choose a category first");
        try {
            setSaving(true);
            const { data } = await axiosInstance.post("/foods/create", { ...foodForm, price: Number(foodForm.price), restaurantId: restaurant.id });
            const category = categories.find((item) => item.id === data.food.categoryId);
            setFoods((current) => [{ ...data.food, category }, ...current]);
            setFoodForm(initialFood);
            setShowFoodForm(false);
            toast.success("Dish added to the menu");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add dish");
        } finally {
            setSaving(false);
        }
    };

    const deleteFood = async (id) => {
        if (!window.confirm("Remove this dish from your menu?")) return;
        try {
            await axiosInstance.delete(`/foods/${id}`);
            setFoods((current) => current.filter((food) => food.id !== id));
            toast.success("Dish removed");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to remove dish");
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white"><Loader2 className="animate-spin text-orange-500" size={42} /></div>;
    if (!dashboard) return <div className="min-h-screen bg-[#0b0f19] text-white p-10 flex items-center justify-center font-medium">Restaurant dashboard could not be loaded.</div>;

    const pendingOrders = orders.filter((order) => order.orderStatus === "PENDING").length;
    const navItems = [
        ["overview", "Overview", LayoutDashboard],
        ["orders", "Orders", Package],
        ["menu", "Menu Management", UtensilsCrossed],
        ["settings", "Settings", Settings],
    ];

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 md:flex font-sans selection:bg-orange-500 selection:text-white">
            {/* Sidebar */}
            <aside className="md:sticky md:top-0 md:h-screen md:w-72 shrink-0 bg-[#111827]/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-800/80 p-6 flex flex-col z-20">
                <div className="flex items-center gap-3.5 mb-8">
                    {restaurant.image ? (
                        <img src={restaurant.image} alt={restaurant.name} className="w-12 h-12 rounded-2xl object-cover shadow-md border border-slate-700" />
                    ) : (
                        <div className="p-3 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/20 text-white">
                            <Store size={24} />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-black text-base truncate text-white">{restaurant.name}</p>
                        <p className="text-xs text-slate-400 font-medium">Partner Dashboard</p>
                    </div>
                </div>

                {/* Status Toggle Box */}
                <div className="mb-6 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full animate-pulse ${restaurant.isOpen ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-rose-500"}`} />
                        <div className="text-xs">
                            <p className="font-bold text-slate-200">{restaurant.isOpen ? "Store Open" : "Store Closed"}</p>
                            <p className="text-slate-400 text-[10px]">{restaurant.isOpen ? "Accepting live orders" : "Not taking orders"}</p>
                        </div>
                    </div>
                    <button 
                        onClick={toggleRestaurantStatus}
                        disabled={togglingStatus}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            restaurant.isOpen 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                    >
                        <Power size={12} /> {restaurant.isOpen ? "Close" : "Open"}
                    </button>
                </div>

                <nav className="flex md:block gap-2 overflow-x-auto md:space-y-2 pb-2 md:pb-0 scrollbar-none">
                    {navItems.map(([id, label, Icon]) => (
                        <button 
                            key={id} 
                            onClick={() => setActiveTab(id)} 
                            className={`shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                                activeTab === id 
                                ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/25" 
                                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                            }`}
                        >
                            <Icon size={18} />
                            {label}
                            {id === "orders" && pendingOrders > 0 && (
                                <span className="ml-auto text-xs bg-amber-400 text-slate-950 font-black rounded-full px-2 py-0.5 animate-bounce">
                                    {pendingOrders}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-6 md:mt-auto space-y-2.5 pt-4 border-t border-slate-800/80">
                    <button onClick={loadDashboard} className="w-full flex justify-center items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-300 transition-colors cursor-pointer">
                        <RefreshCw size={14} /> Refresh Data
                    </button>
                    <button onClick={() => logout(navigate)} className="w-full flex justify-center items-center gap-2 rounded-xl px-3 py-3 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 transition-colors cursor-pointer">
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {activeTab === "overview" ? `Welcome back, ${user?.name || 'Chef'}! 👋` : activeTab === "orders" ? "Live Order Management" : activeTab === "menu" ? "Menu & Catalog" : "Restaurant Settings"}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium flex items-center gap-2">
                            <MapPin size={14} className="text-orange-500" /> {restaurant.address}, {restaurant.city} 
                            <span className="text-slate-600">•</span> 
                            <span className={restaurant.isOpen ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                                {restaurant.isOpen ? "🟢 Accepting orders" : "🔴 Store is closed"}
                            </span>
                        </p>
                    </div>
                    {activeTab === "menu" && (
                        <button onClick={() => setShowFoodForm(true)} className="bg-gradient-to-r from-orange-600 to-amber-500 hover:opacity-95 px-5 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer">
                            <Plus size={18} /> Add New Dish
                        </button>
                    )}
                </header>

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                    <>
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Stat label="Total Orders" value={dashboard.totalOrders} icon={Package} color="text-blue-400" />
                            <Stat label="Today's Orders" value={dashboard.todayOrders} icon={Clock3} color="text-amber-400" />
                            <Stat label="Pending Action" value={dashboard.pendingOrders} icon={Truck} color="text-orange-400" />
                            <Stat label="Total Revenue" value={`Rs. ${dashboard.totalRevenue}`} icon={BarChart3} color="text-emerald-450 text-emerald-400" />
                        </section>

                        <section className="mt-8 grid lg:grid-cols-2 gap-6">
                            <div className="bg-[#111827]/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
                                <h2 className="font-bold text-base text-white flex items-center gap-2 mb-4">
                                    <Store size={18} className="text-orange-500" /> Restaurant Details
                                </h2>
                                {restaurant.image && (
                                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-36 object-cover rounded-2xl mb-4 border border-slate-800" />
                                )}
                                <div className="space-y-3.5 text-sm text-slate-300">
                                    <p className="flex items-start gap-2.5">
                                        <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                        <span>{restaurant.address}, {restaurant.city}</span>
                                    </p>
                                    <p className="text-slate-400 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs leading-relaxed">
                                        {restaurant.description || "Add a descriptive bio for your restaurant to attract more food lovers."}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                                        <span>📞 {restaurant.phone || "No phone added"}</span>
                                        <span>✉️ {restaurant.email || user?.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#111827]/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
                                <h2 className="font-bold text-base text-white flex items-center gap-2 mb-4">
                                    <BarChart3 size={18} className="text-orange-500" /> Performance Breakdown
                                </h2>
                                <div className="space-y-3 text-sm text-slate-300">
                                    <div className="flex justify-between items-center bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800/80">
                                        <span className="text-slate-400">Menu Catalog</span>
                                        <span className="font-bold text-white">{foods.length} items across {categories.length} categories</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800/80">
                                        <span className="text-slate-400">Order Delivery Rate</span>
                                        <span className="font-bold text-emerald-400">{dashboard.deliveredOrders} Delivered</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800/80">
                                        <span className="text-slate-400">Cancellations</span>
                                        <span className="font-bold text-rose-400">{dashboard.cancelledOrders} Cancelled</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800/80">
                                        <span className="text-slate-400">Average Rating</span>
                                        <span className="font-bold text-amber-400">⭐ {restaurant.rating || 0} ({restaurant.totalReview || 0} reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                    <section className="space-y-4">
                        {orders.length === 0 ? (
                            <Empty icon={Package} text="No customer orders received yet." />
                        ) : (
                            orders.map((order) => (
                                <article key={order.id} className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md">
                                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold text-base text-white">{order.user?.name || "Customer"}</p>
                                                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md">ID: #{order.id.slice(-6)}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                            
                                            <div className="mt-3.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800/60 text-sm text-slate-300">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between py-0.5">
                                                        <span>{item.name} × <strong className="text-orange-400">{item.quantity}</strong></span>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                                                <MapPin size={13} className="text-orange-500" /> {order.address?.street}, {order.address?.city}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                                            <b className="text-orange-400 text-lg font-black">Rs. {order.grantTotal}</b>
                                            <select 
                                                value={order.orderStatus} 
                                                onChange={(event) => updateOrderStatus(order.id, event.target.value)} 
                                                className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white cursor-pointer focus:outline-none focus:border-orange-500"
                                            >
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>{formatStatus(status)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </section>
                )}

                {/* MENU TAB */}
                {activeTab === "menu" && (
                    <section className="space-y-6">
                        <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
                            <h2 className="font-bold flex gap-2 items-center text-white text-sm">
                                <Tag size={17} className="text-orange-500" /> Manage Categories
                            </h2>
                            <form onSubmit={createCategory} className="mt-3 flex gap-2">
                                <input 
                                    value={categoryName} 
                                    onChange={(event) => setCategoryName(event.target.value)} 
                                    placeholder="e.g. Burgers, Drinks, Momo" 
                                    className="min-w-0 flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" 
                                />
                                <button disabled={saving} className="bg-gradient-to-r from-orange-600 to-amber-500 hover:opacity-95 rounded-xl px-5 text-sm font-bold cursor-pointer transition-all">
                                    Add Category
                                </button>
                            </form>
                            <div className="mt-3.5 flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <span key={category.id} className="bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1 text-xs font-medium text-slate-300">
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {foods.length === 0 ? (
                            <Empty icon={UtensilsCrossed} text="Your menu is empty. Add your first dish to start selling!" />
                        ) : (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {foods.map((food) => (
                                    <article key={food.id} className="bg-[#111827]/70 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
                                        <div className="relative h-44 overflow-hidden">
                                            <img 
                                                src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                                                alt={food.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                            <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-orange-400 border border-slate-800 px-2.5 py-1 rounded-lg">
                                                {food.category?.name || "Uncategorized"}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start gap-3">
                                                <h3 className="font-bold text-white text-base truncate">{food.name}</h3>
                                                <button onClick={() => deleteFood(food.id)} aria-label={`Delete ${food.name}`} className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">{food.description || "No description provided."}</p>
                                            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center">
                                                <span className="text-orange-400 font-black text-base">Rs. {food.price}</span>
                                                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* SETTINGS TAB */}
                {activeTab === "settings" && (
                    <section className="max-w-xl bg-[#111827]/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                            <Settings size={18} className="text-orange-500" /> Update Restaurant Profile
                        </h2>
                        <p className="text-xs text-slate-400 mb-6">Modify your restaurant storefront image and details visible to customers.</p>

                        <form onSubmit={handleUpdateRestaurant} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Restaurant Name</label>
                                <input 
                                    required 
                                    value={restaurantForm.name} 
                                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Restaurant Banner / Profile Image URL</label>
                                <div className="flex gap-3 items-center">
                                    <input 
                                        value={restaurantForm.image} 
                                        onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })} 
                                        placeholder="https://images.unsplash.com/photo-..." 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" 
                                    />
                                </div>
                                {restaurantForm.image && (
                                    <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-slate-700">
                                        <img src={restaurantForm.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Contact Phone</label>
                                <input 
                                    value={restaurantForm.phone} 
                                    onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })} 
                                    placeholder="9800000000" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Description / Bio</label>
                                <textarea 
                                    rows="3"
                                    value={restaurantForm.description} 
                                    onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })} 
                                    placeholder="Tell your customers about your specialties..." 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-orange-500" 
                                />
                            </div>

                            <button 
                                disabled={saving} 
                                className="w-full mt-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:opacity-95 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 cursor-pointer transition-all"
                            >
                                {saving ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </form>
                    </section>
                )}
            </main>

            {/* Food Creation Modal */}
            {showFoodForm && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-fade-in">
                    <form onSubmit={createFood} className="w-full max-w-md bg-[#111827] border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-xl font-black text-white">Add New Dish</h2>
                        <div className="mt-5 space-y-3.5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Dish Name</label>
                                <input required value={foodForm.name} onChange={(event) => setFoodForm({ ...foodForm, name: event.target.value })} placeholder="e.g. Chicken Momo" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Price (Rs.)</label>
                                <input required min="1" type="number" value={foodForm.price} onChange={(event) => setFoodForm({ ...foodForm, price: event.target.value })} placeholder="e.g. 250" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Category</label>
                                <select required value={foodForm.categoryId} onChange={(event) => setFoodForm({ ...foodForm, categoryId: event.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer">
                                    <option value="">Select Category</option>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Image URL (Optional)</label>
                                <input value={foodForm.image} onChange={(event) => setFoodForm({ ...foodForm, image: event.target.value })} placeholder="https://image-link.com/dish.jpg" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Description (Optional)</label>
                                <textarea value={foodForm.description} onChange={(event) => setFoodForm({ ...foodForm, description: event.target.value })} placeholder="Ingredients, taste, portions..." rows="3" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-orange-500" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setShowFoodForm(false)} className="px-4 py-2.5 text-sm text-slate-300 hover:text-white cursor-pointer font-medium">Cancel</button>
                            <button disabled={saving} className="bg-gradient-to-r from-orange-600 to-amber-500 hover:opacity-95 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 cursor-pointer">
                                {saving ? "Saving..." : "Add Dish"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, icon: Icon, color = "text-orange-500" }) { 
    return (
        <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col justify-between">
            <Icon size={20} className={`${color} mb-3`} />
            <div>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-400 font-medium">{label}</p>
            </div>
        </div>
    ); 
}

function Empty({ icon: Icon, text }) { 
    return (
        <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <Icon className="text-orange-500 mb-3 opacity-80" size={36} />
            <p className="text-sm font-medium">{text}</p>
        </div>
    ); 
}