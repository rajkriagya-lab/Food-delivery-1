import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    UtensilsCrossed, 
    ShoppingBag, 
    Plus, 
    Trash2, 
    Store, 
    RefreshCw,
    LogOut,
    User,
    Mail,
    MapPin,
    CheckCircle2,
    Clock,
    Truck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const API_BASE = 'http://localhost:8000/api';

export default function RestaurantDashboard() {
    const { user, logout } = useAuthStore();
    const token = user?.token; // Adjust depending on how you store your auth token

    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [restaurantInfo, setRestaurantInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [newItem, setNewItem] = useState({ 
        name: '', 
        price: '', 
        category: '', 
        description: '', 
        image: '' 
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            };

            const [overviewRes, ordersRes, foodsRes] = await Promise.all([
                fetch(`${API_BASE}/dashboard/overview`, { headers }),
                fetch(`${API_BASE}/dashboard/recent-order`, { headers }),
                fetch(`${API_BASE}/dashboard/top-selling-foods`, { headers })
            ]);

            const overviewData = await overviewRes.json();
            const ordersData = await ordersRes.json();
            const foodsData = await foodsRes.json();

            setRestaurantInfo(overviewData.restaurant || null);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setMenuItems(Array.isArray(foodsData) ? foodsData : []);
        } catch (err) {
            console.error("Error connecting to backend API:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE}/dashboard/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(orders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord));
            }
        } catch (err) {
            console.error("Failed to update order status", err);
        }
    };

    const handleDeleteMenuItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this dish?")) return;
        try {
            const res = await fetch(`${API_BASE}/dashboard/foods/${id}`, { 
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setMenuItems(menuItems.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete menu item", err);
        }
    };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price) return;
        try {
            const res = await fetch(`${API_BASE}/dashboard/foods`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    ...newItem,
                    price: Number(newItem.price),
                    image: newItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
                })
            });
            const savedItem = await res.json();
            if (res.ok) {
                setMenuItems([savedItem, ...menuItems]);
                setNewItem({ name: '', price: '', category: '', description: '', image: '' });
                setIsAddModalOpen(false);
            }
        } catch (err) {
            console.error("Failed to add dish", err);
        }
    };

    return (
        <div className="min-h-screen bg-primary text-white flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-card/90 backdrop-blur-xl border-r border-gray-800 p-6 flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-btn flex items-center justify-center text-white font-bold shadow-lg shadow-btn/30">
                            <Store size={22} />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-base tracking-tight text-white truncate max-w-[130px]">
                                {restaurantInfo?.name || user?.name || 'Restaurant'}
                            </h1>
                            <p className="text-gray-400 text-xs">Owner Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5 pt-4">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'overview' ? 'bg-btn text-white shadow-lg shadow-btn/20' : 'text-gray-400 hover:text-white hover:bg-card'
                            }`}
                        >
                            <LayoutDashboard size={18} /> Overview & Info
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'orders' ? 'bg-btn text-white shadow-lg shadow-btn/20' : 'text-gray-400 hover:text-white hover:bg-card'
                            }`}
                        >
                            <ShoppingBag size={18} /> Live Orders
                            {orders.filter(o => o.status === 'Pending').length > 0 && (
                                <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    {orders.filter(o => o.status === 'Pending').length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'menu' ? 'bg-btn text-white shadow-lg shadow-btn/20' : 'text-gray-400 hover:text-white hover:bg-card'
                            }`}
                        >
                            <UtensilsCrossed size={18} /> Menu Management
                        </button>
                    </nav>
                </div>

                <div className="pt-6 border-t border-gray-800 space-y-3">
                    <button 
                        onClick={fetchDashboardData}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card border border-gray-800 text-gray-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                        <RefreshCw size={14} /> Refresh Data
                    </button>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold capitalize tracking-tight text-white">
                            {activeTab === 'overview' ? 'Restaurant Overview' : activeTab}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Live data synchronized securely with your backend API.</p>
                    </div>
                    {activeTab === 'menu' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-btn text-white px-5 py-3 rounded-2xl font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-btn/25 flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                            <Plus size={18} /> Add New Dish
                        </button>
                    )}
                </header>

                {loading ? (
                    <div className="flex justify-center items-center py-28">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-btn"></div>
                    </div>
                ) : (
                    <>
                        {/* TAB 1: OVERVIEW & OWNER INFO */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <div className="bg-gradient-to-b from-card/90 to-card/50 border border-gray-800 p-6 rounded-3xl shadow-xl flex flex-col gap-2">
                                        <span className="text-xs font-semibold uppercase text-gray-400">Total Incoming Orders</span>
                                        <h3 className="text-3xl font-extrabold text-white">{orders.length}</h3>
                                    </div>
                                    <div className="bg-gradient-to-b from-card/90 to-card/50 border border-gray-800 p-6 rounded-3xl shadow-xl flex flex-col gap-2">
                                        <span className="text-xs font-semibold uppercase text-gray-400">Dishes on Menu</span>
                                        <h3 className="text-3xl font-extrabold text-white">{menuItems.length}</h3>
                                    </div>
                                    <div className="bg-gradient-to-b from-card/90 to-card/50 border border-gray-800 p-6 rounded-3xl shadow-xl flex flex-col gap-2">
                                        <span className="text-xs font-semibold uppercase text-gray-400">Operational Status</span>
                                        <h3 className="text-2xl font-extrabold text-emerald-400 flex items-center gap-2 mt-1">
                                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> Store Active
                                        </h3>
                                    </div>
                                </div>

                                {/* Restaurant & Owner Details Card */}
                                <div className="bg-card/90 border border-gray-800 p-8 rounded-3xl shadow-xl space-y-6">
                                    <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-4">Store & Owner Profile</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-2xl bg-btn/15 text-btn"><Store size={20} /></div>
                                            <div>
                                                <span className="text-gray-400 text-xs block">Restaurant Name</span>
                                                <span className="font-bold text-white text-base">{restaurantInfo?.name || user?.restaurantName || 'Gourmet Outlet'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400"><User size={20} /></div>
                                            <div>
                                                <span className="text-gray-400 text-xs block">Owner Name</span>
                                                <span className="font-bold text-white text-base">{user?.name || 'Authorized Partner'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400"><Mail size={20} /></div>
                                            <div>
                                                <span className="text-gray-400 text-xs block">Email Address</span>
                                                <span className="font-bold text-white text-base">{user?.email || restaurantInfo?.email || 'owner@neon.db'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400"><MapPin size={20} /></div>
                                            <div>
                                                <span className="text-gray-400 text-xs block">Location / Address</span>
                                                <span className="font-bold text-white text-base">{restaurantInfo?.address || 'Main Street, City Center'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: LIVE ORDERS & DELIVERY STATUS */}
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                {orders.length === 0 ? (
                                    <div className="text-gray-500 py-16 text-center bg-card/40 border border-gray-800 rounded-3xl">
                                        No active orders recorded yet.
                                    </div>
                                ) : (
                                    orders.map(ord => (
                                        <div key={ord.id} className="bg-card/90 border border-gray-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-extrabold text-white text-base">{ord.customer_name || 'Valued Customer'}</span>
                                                    <span className="text-xs text-gray-400">Order #{ord.id}</span>
                                                </div>
                                                <p className="text-gray-300 text-sm mt-1">{ord.items_description || ord.items}</p>
                                                <span className="text-xs font-bold text-btn mt-2 block">Total Amount: Rs. {ord.total_amount}</span>
                                            </div>

                                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                                        ord.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 
                                                        ord.status === 'Preparing' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 
                                                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                    }`}>
                                                        {ord.status === 'Pending' && <Clock size={13} />}
                                                        {ord.status === 'Preparing' && <Truck size={13} />}
                                                        {ord.status === 'Delivered' && <CheckCircle2 size={13} />}
                                                        {ord.status}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    {ord.status === 'Pending' && (
                                                        <button 
                                                            onClick={() => handleUpdateOrderStatus(ord.id, 'Preparing')} 
                                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                                                        >
                                                            Start Preparing
                                                        </button>
                                                    )}
                                                    {ord.status === 'Preparing' && (
                                                        <button 
                                                            onClick={() => handleUpdateOrderStatus(ord.id, 'Delivered')} 
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                                                        >
                                                            Mark Delivered
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TAB 3: MENU MANAGEMENT */}
                        {activeTab === 'menu' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {menuItems.map(item => (
                                    <div key={item.id} className="bg-card/90 border border-gray-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group">
                                        <div className="h-44 w-full relative overflow-hidden bg-primary">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                                            <div>
                                                <h3 className="font-bold text-white text-base">{item.name}</h3>
                                                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
                                                <span className="font-extrabold text-btn text-base">Rs. {item.price}</span>
                                                <button onClick={() => handleDeleteMenuItem(item.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modal for Adding New Dish */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-white">Add New Food Item</h3>
                        <form onSubmit={handleAddMenuItem} className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Dish Name" 
                                required 
                                value={newItem.name} 
                                onChange={e => setNewItem({...newItem, name: e.target.value})} 
                                className="w-full bg-primary border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-btn" 
                            />
                            <input 
                                type="number" 
                                placeholder="Price (Rs.)" 
                                required 
                                value={newItem.price} 
                                onChange={e => setNewItem({...newItem, price: e.target.value})} 
                                className="w-full bg-primary border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-btn" 
                            />
                            <input 
                                type="text" 
                                placeholder="Category (e.g. Fast Food, Desserts)" 
                                value={newItem.category} 
                                onChange={e => setNewItem({...newItem, category: e.target.value})} 
                                className="w-full bg-primary border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-btn" 
                            />
                            <textarea 
                                placeholder="Short description of the dish" 
                                rows="2" 
                                value={newItem.description} 
                                onChange={e => setNewItem({...newItem, description: e.target.value})} 
                                className="w-full bg-primary border border-gray-800 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-btn"
                            ></textarea>
                            <input 
                                type="url" 
                                placeholder="Image URL (optional)" 
                                value={newItem.image} 
                                onChange={e => setNewItem({...newItem, image: e.target.value})} 
                                className="w-full bg-primary border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-btn" 
                            />
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)} 
                                    className="px-5 py-2.5 rounded-xl bg-primary border border-gray-800 text-gray-300 hover:text-white cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 rounded-xl bg-btn text-white font-bold cursor-pointer"
                                >
                                    Save Dish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}