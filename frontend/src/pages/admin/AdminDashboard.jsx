import { useEffect, useMemo, useState } from "react";
import {
  Building2, ChevronRight, CircleDollarSign, Clock3, LayoutDashboard,
  Loader2, LogOut, Menu, Package, RefreshCw, Search, ShieldCheck,
  Store, Truck, Users, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Api/axios";
import { useAuthStore } from "../../store/authStore";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" }) : "—";
const statusLabel = (status) => (status || "PENDING").replaceAll("_", " ");

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [overviewRes, usersRes, restaurantsRes, ordersRes] = await Promise.all([
        axiosInstance.get("/admin/overview"),
        axiosInstance.get("/admin/users"),
        axiosInstance.get("/admin/restaurants"),
        axiosInstance.get("/admin/orders"),
      ]);
      setOverview(overviewRes.data.overview);
      setUsers(usersRes.data.users || []);
      setRestaurants(restaurantsRes.data.restaurants || []);
      setOrders(ordersRes.data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const toggleRestaurant = async (restaurant) => {
    try {
      const { data } = await axiosInstance.patch(`/admin/restaurants/${restaurant.id}/status`);
      setRestaurants((current) => current.map((item) => item.id === restaurant.id ? { ...item, isOpen: data.restaurant.isOpen } : item));
      toast.success(data.message || "Restaurant status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update restaurant status");
    }
  };

  const deleteUser = async (target) => {
    if (!window.confirm(`Remove ${target.name || target.email}? This action cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/admin/users/${target.id}`);
      setUsers((current) => current.filter((item) => item.id !== target.id));
      setOverview((current) => current ? { ...current, totalUsers: Math.max(0, current.totalUsers - 1) } : current);
      toast.success("User removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove user");
    }
  };

  const query = search.trim().toLowerCase();
  
  const filteredUsers = useMemo(() => 
    users.filter((item) => `${item.name || ""} ${item.email || ""} ${item.role || ""}`.toLowerCase().includes(query)), 
    [users, query]
  );
  
  const filteredRestaurants = useMemo(() => 
    restaurants.filter((item) => `${item.name || ""} ${item.city || ""} ${item.owner?.name || ""}`.toLowerCase().includes(query)), 
    [restaurants, query]
  );
  
  const filteredOrders = useMemo(() => 
    orders.filter((item) => `${item.id || ""} ${item.user?.name || ""} ${item.restaurant?.name || ""} ${item.orderStatus || ""}`.toLowerCase().includes(query)), 
    [orders, query]
  );

  const navItems = [
    ["overview", "Overview", LayoutDashboard], 
    ["users", "Users", Users], 
    ["restaurants", "Restaurants", Store], 
    ["orders", "Orders", Package]
  ];

  if (loading) return <div className="min-h-screen bg-slate-950 text-orange-400 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex selection:bg-orange-500 selection:text-white">
      <aside className={`${menuOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 p-6 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0`}>
        <div className="flex items-center gap-3 mb-9">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-500/20"><ShieldCheck size={23} /></div>
          <div><p className="font-black text-white">Khanna Admin</p><p className="text-xs text-slate-400">Control center</p></div>
          <button onClick={() => setMenuOpen(false)} className="ml-auto md:hidden text-slate-400"><X size={20} /></button>
        </div>
        <nav className="space-y-2">
          {navItems.map(([id, label, Icon]) => (
            <button key={id} onClick={() => { setActiveTab(id); setMenuOpen(false); setSearch(""); }} className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <div className="mt-auto absolute bottom-6 left-6 right-6 border-t border-slate-800 pt-5">
          <p className="truncate text-sm font-bold text-white">{user?.name || "Administrator"}</p>
          <p className="truncate text-xs text-slate-500 mb-4">{user?.email}</p>
          <button onClick={() => logout(navigate)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/20">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {menuOpen && <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-black/60 md:hidden" />}
      
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="rounded-xl border border-slate-800 p-2.5 text-slate-300 md:hidden"><Menu size={20} /></button>
            <div>
              <p className="text-sm font-medium text-orange-400">Platform management</p>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {activeTab === "overview" ? "Admin dashboard" : activeTab[0].toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
          </div>
          <button onClick={() => loadDashboard(true)} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-60">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </header>

        {activeTab === "overview" && <Overview overview={overview} orders={orders} restaurants={restaurants} setActiveTab={setActiveTab} />}
        {activeTab !== "overview" && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-white">
                  {activeTab === "users" ? "All accounts" : activeTab === "restaurants" ? "Restaurant partners" : "Platform orders"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">Manage and monitor your marketplace activity.</p>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-400">
                <Search size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${activeTab}...`} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 sm:w-52" />
              </label>
            </div>
            {activeTab === "users" ? (
              <UsersTable users={filteredUsers} currentUser={user} onDelete={deleteUser} />
            ) : activeTab === "restaurants" ? (
              <RestaurantsTable restaurants={filteredRestaurants} onToggle={toggleRestaurant} />
            ) : (
              <OrdersTable orders={filteredOrders} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Overview({ overview, orders, restaurants, setActiveTab }) {
  const stats = [
    ["Total revenue", formatCurrency(overview?.totalRevenue), CircleDollarSign, "text-emerald-400"], 
    ["Total orders", overview?.totalOrders || 0, Package, "text-blue-400"], 
    ["Customers", overview?.totalCustomers || 0, Users, "text-violet-400"], 
    ["Partners", overview?.totalRestaurants || 0, Building2, "text-orange-400"]
  ];

  return (
    <>
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(([label, value, Icon, color]) => (
          <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Icon className={color} size={21} />
            <p className="mt-5 text-2xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white">Recent orders</h2>
              <p className="mt-1 text-xs text-slate-400">Latest activity across the platform</p>
            </div>
            <button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-orange-400 hover:text-orange-300">View all</button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center gap-3 rounded-2xl bg-slate-950/70 p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-800 text-orange-400"><Package size={17} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{order.user?.name || "Customer"}</p>
                  <p className="truncate text-xs text-slate-500">{order.restaurant?.name || "Restaurant"} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatCurrency(order.grandTotal || order.grantTotal)}</p>
                  <Status status={order.orderStatus} />
                </div>
              </div>
            ))}
            {orders.length === 0 && <Empty text="No orders have been placed yet." />}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <h2 className="font-bold text-white">Operations snapshot</h2>
          <div className="mt-5 space-y-4">
            <Metric label="Pending orders" value={overview?.pendingOrders || 0} icon={Clock3} color="text-amber-400" />
            <Metric label="Delivered orders" value={overview?.deliveredOrders || 0} icon={Truck} color="text-emerald-400" />
            <Metric label="Open restaurants" value={restaurants.filter((item) => item.isOpen).length} icon={Store} color="text-orange-400" />
            <Metric label="Cancelled orders" value={overview?.cancelledOrders || 0} icon={X} color="text-rose-400" />
          </div>
        </div>
      </section>
    </>
  );
}

function UsersTable({ users, currentUser, onDelete }) { 
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[630px] text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="pb-3 font-medium">User</th>
            <th className="pb-3 font-medium">Role</th>
            <th className="pb-3 font-medium">Joined</th>
            <th className="pb-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item) => (
            <tr key={item.id} className="border-b border-slate-800/70">
              <td className="py-4">
                <p className="font-bold text-white">{item.name || "Unnamed user"}</p>
                <p className="text-xs text-slate-500">{item.email}</p>
              </td>
              <td className="py-4">
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300">
                  {(item.role || "USER").replaceAll("_", " ")}
                </span>
              </td>
              <td className="py-4 text-slate-400">{formatDate(item.createdAt)}</td>
              <td className="py-4 text-right">
                {item.id !== currentUser?.id && (
                  <button onClick={() => onDelete(item)} className="rounded-lg px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10">Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <Empty text="No users match your search." />}
    </div>
  ); 
}

function RestaurantsTable({ restaurants, onToggle }) { 
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {restaurants.map((item) => (
        <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">{item.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{item.city} · {item.owner?.name || "No owner"}</p>
            </div>
            <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-bold ${item.isOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              {item.isOpen ? "Open" : "Closed"}
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-400">{item._count?.orders || 0} orders · {item._count?.food || 0} menu items</p>
            <button onClick={() => onToggle(item)} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">
              {item.isOpen ? "Close store" : "Open store"}
            </button>
          </div>
        </article>
      ))}
      {restaurants.length === 0 && <Empty text="No restaurants match your search." />}
    </div>
  ); 
}

function OrdersTable({ orders }) { 
  return (
    <div className="space-y-3">
      {orders.map((item) => (
        <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-orange-400"><Package size={18} /></div>
          <div className="min-w-40 flex-1">
            <p className="font-bold text-white">{item.user?.name || "Customer"}</p>
            <p className="text-xs text-slate-500">{item.restaurant?.name || "Restaurant"} · {formatDate(item.createdAt)}</p>
          </div>
          <p className="text-sm font-bold text-white">{formatCurrency(item.grandTotal || item.grantTotal)}</p>
          <Status status={item.orderStatus} />
          <ChevronRight className="text-slate-600" size={18} />
        </article>
      ))}
      {orders.length === 0 && <Empty text="No orders match your search." />}
    </div>
  ); 
}

function Metric({ label, value, icon: Icon, color }) { 
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-950/70 p-3">
      <Icon className={color} size={18} />
      <p className="flex-1 text-sm text-slate-400">{label}</p>
      <p className="font-black text-white">{value}</p>
    </div>
  ); 
}

function Status({ status }) { 
  const colors = { 
    DELIVERED: "bg-emerald-500/10 text-emerald-400", 
    CANCELLED: "bg-rose-500/10 text-rose-400", 
    PENDING: "bg-amber-500/10 text-amber-400", 
    PROCESSING: "bg-blue-500/10 text-blue-400", 
    OUT_FOR_DELIVERY: "bg-violet-500/10 text-violet-400" 
  }; 
  return <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-black uppercase ${colors[status] || colors.PENDING}`}>{statusLabel(status)}</span>; 
}

function Empty({ text }) { 
  return <div className="rounded-2xl border border-dashed border-slate-700 py-10 text-center text-sm text-slate-500">{text}</div>; 
}
