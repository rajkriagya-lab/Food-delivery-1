import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Loader2, MapPin, PackageOpen, ReceiptText } from "lucide-react";
import axiosInstance from "../../Api/axios";

const statusStyles = {
    PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    PROCESSING: "bg-sky-500/10 text-sky-300 border-sky-500/25",
    OUT_FOR_DELIVERY: "bg-violet-500/10 text-violet-300 border-violet-500/25",
    DELIVERED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    CANCELLED: "bg-red-500/10 text-red-300 border-red-500/25",
};

const formatStatus = (status) => (status || "PENDING").replaceAll("_", " ");

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axiosInstance.get("/orders/my");
                setOrders(data.order || data.orders || []);
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Unable to load your orders.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-gray-300"><Loader2 className="animate-spin text-btn" size={36} /> Loading your orders...</div>;
    }

    return (
        <div className="min-h-screen bg-primary text-white py-10 px-5 md:px-10">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black flex items-center gap-3"><ReceiptText className="text-btn" /> My orders</h1>
                    <p className="mt-2 text-sm text-gray-400">Check the current status and delivery details for every order.</p>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="rounded-3xl border border-gray-800 bg-card/70 text-center py-16 px-5">
                        <PackageOpen className="mx-auto text-btn mb-4" size={40} />
                        <h2 className="text-xl font-bold">No orders yet</h2>
                        <p className="text-sm text-gray-400 mt-2 mb-6">Your placed orders will appear here.</p>
                        <Link to="/restaurant" className="inline-flex bg-btn px-5 py-3 rounded-xl text-sm font-bold">Browse restaurants</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const status = order.orderStatus || "PENDING";
                            return (
                                <article key={order.id} className="rounded-3xl border border-gray-800 bg-card/70 p-5 sm:p-6 shadow-lg">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div>
                                            <p className="font-bold text-lg">{order.restaurant?.name || "Restaurant order"}</p>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock3 size={13} /> {new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                        <span className={`w-fit border px-3 py-1.5 rounded-full text-xs font-bold ${statusStyles[status] || statusStyles.PENDING}`}>{formatStatus(status)}</span>
                                    </div>

                                    <div className="mt-5 border-y border-gray-800 py-4 space-y-2 text-sm">
                                        {order.items?.map((item) => <div key={item.id} className="flex justify-between gap-4 text-gray-300"><span>{item.name} × {item.quantity}</span><span>Rs. {item.price * item.quantity}</span></div>)}
                                    </div>

                                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                                        <span className="text-gray-400 flex items-center gap-1.5"><MapPin size={15} className="text-btn" /> {order.address?.street}, {order.address?.city}</span>
                                        <span className="font-black text-btn text-base">Total: Rs. {order.grantTotal}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
