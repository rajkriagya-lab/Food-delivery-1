import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, MapPin, Plus, ShoppingBag, CreditCard, Wallet, Truck, ArrowLeft, Loader2, ShieldCheck, CircleCheckBig } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../Api/axios";

export default function Checkout() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [cartLoading, setCartLoading] = useState(true);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [addressLoading, setAddressLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderConfirmation, setOrderConfirmation] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");

    const deliveryFee = 100;
    const grandTotal = totalAmount + deliveryFee;

    const fetchCart = async () => {
        try {
            setCartLoading(true);
            const { data } = await axiosInstance.get("/cart");
            setCartItems(data.items || data.cart?.items || []);
            setTotalAmount(data.totalAmount || data.cart?.totalAmount || 0);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load cart");
        } finally {
            setCartLoading(false);
        }
    };

    const fetchAddress = async () => {
        try {
            const { data } = await axiosInstance.get("/address/my");
            if (data.success) {
                const addressList = data.addressess || data.addresses || [];
                setAddresses(addressList);

                const defaultAddress = addressList.find((address) => address.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                } else if (addressList.length > 0) {
                    setSelectedAddressId(addressList[0].id);
                }
            }
        } catch (error) {
            setAddresses([]);
        } finally {
            setAddressLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        fetchAddress();
    }, []);

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        try {
            setOrderLoading(true);
            const payload = {
                paymentMethod: paymentMethod,
            };
            if (selectedAddressId) {
                payload.addressId = selectedAddressId;
            }

            const { data } = await axiosInstance.post("/orders/create", payload);

            if (data.success) {
                if (paymentMethod === "ESEWA") {
                    const payment = await axiosInstance.post(`/payments/esewa/initiate/${data.order.id}`);
                    const form = document.createElement("form");
                    form.method = "POST";
                    form.action = payment.data.gatewayUrl;
                    Object.entries(payment.data.fields).forEach(([name, value]) => { const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; form.appendChild(input); });
                    document.body.appendChild(form);
                    form.submit();
                    return;
                }
                if (paymentMethod === "KHALTI") {
                    const payment = await axiosInstance.post(`/payments/khalti/initiate/${data.order.id}`);
                    window.location.assign(payment.data.paymentUrl);
                    return;
                }

                setOrderConfirmation({
                    id: data.order?.id,
                    total: data.order?.grantTotal ?? grandTotal,
                });
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to place order",
            );
        } finally {
            setOrderLoading(false);
        }
    };

    if (cartLoading || addressLoading) {
        return (
            <div className="min-h-screen bg-primary text-white flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-btn mb-4" />
                <p className="text-gray-300 text-sm font-medium">Preparing your checkout...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary text-white py-10 px-5 md:px-10 selection:bg-btn selection:text-white">
            {orderConfirmation && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
                    <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-card p-7 text-center shadow-2xl">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                            <CircleCheckBig size={38} />
                        </div>
                        <h2 className="text-2xl font-black">Order confirmed!</h2>
                        <p className="mt-3 text-sm leading-relaxed text-gray-300">
                            Your order has been placed successfully. The restaurant will start preparing it soon.
                        </p>
                        {orderConfirmation.id && <p className="mt-3 text-xs text-gray-400">Order ID: {orderConfirmation.id}</p>}
                        <p className="mt-4 text-lg font-black text-btn">Total: Rs. {orderConfirmation.total}</p>
                        <button
                            type="button"
                            onClick={() => navigate("/orders", { replace: true })}
                            className="mt-6 w-full rounded-xl bg-btn px-4 py-3 text-sm font-bold text-white cursor-pointer"
                        >
                            View my orders
                        </button>
                    </div>
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-card p-2.5 rounded-xl border border-gray-800 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Secure Checkout</h1>
                        <p className="text-xs text-gray-400">Choose your address and payment option to complete order.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card/70 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <MapPin size={18} className="text-btn" />
                                    Select Delivery Address
                                </h2>
                                <Link
                                    to="/address/add"
                                    className="text-xs font-semibold text-btn bg-btn/10 hover:bg-btn/20 px-3 py-1.5 rounded-xl border border-btn/25 flex items-center gap-1 transition-all"
                                >
                                    <Plus size={14} />
                                    <span>Add New</span>
                                </Link>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-8 bg-primary/40 rounded-2xl border border-gray-800">
                                    <p className="text-sm text-gray-400 mb-3">No saved addresses found. Add one to continue with your order.</p>
                                    <Link
                                        to="/address/add"
                                        className="bg-btn text-white px-4 py-2 rounded-xl text-xs font-bold inline-block"
                                    >
                                        Add Address Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {addresses.map((addr) => {
                                        const isSelected = selectedAddressId === addr.id;
                                        return (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`border rounded-2xl p-4 cursor-pointer transition-all relative flex flex-col justify-between ${
                                                    isSelected
                                                        ? "border-btn bg-btn/10 shadow-lg shadow-btn/10"
                                                        : "border-gray-800 bg-primary/40 hover:border-gray-700"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <span className="absolute top-3 right-3 w-5 h-5 bg-btn text-white rounded-full flex items-center justify-center">
                                                        <Check size={12} />
                                                    </span>
                                                )}
                                                <div>
                                                    <span className="text-xs font-bold text-white block mb-1">
                                                        {addr.fullName || addr.name || "Delivery Address"}
                                                    </span>
                                                    <p className="text-xs text-gray-400 line-clamp-2">
                                                        {addr.street || addr.address}, {addr.city}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-3 block">
                                                    Phone: {addr.phone}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="bg-card/70 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <CreditCard size={18} className="text-btn" />
                                Select Payment Method
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label
                                    className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                                        paymentMethod === "CASH_ON_DELIVERY"
                                            ? "border-btn bg-btn/10"
                                            : "border-gray-800 bg-primary/40 hover:border-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Truck size={20} className={paymentMethod === "CASH_ON_DELIVERY" ? "text-btn" : "text-gray-400"} />
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH_ON_DELIVERY"
                                            checked={paymentMethod === "CASH_ON_DELIVERY"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="accent-btn"
                                        />
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs block text-white">Cash on Delivery</span>
                                        <span className="text-[10px] text-gray-400">Pay cash upon arrival</span>
                                    </div>
                                </label>

                                <label
                                    className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                                        paymentMethod === "ESEWA"
                                            ? "border-emerald-500 bg-emerald-500/10"
                                            : "border-gray-800 bg-primary/40 hover:border-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Wallet size={20} className={paymentMethod === "ESEWA" ? "text-emerald-400" : "text-gray-400"} />
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="ESEWA"
                                            checked={paymentMethod === "ESEWA"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="accent-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs block text-white">eSewa</span>
                                        <span className="text-[10px] text-emerald-400 font-medium">Instant Online Pay</span>
                                    </div>
                                </label>

                                <label
                                    className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                                        paymentMethod === "KHALTI"
                                            ? "border-purple-500 bg-purple-500/10"
                                            : "border-gray-800 bg-primary/40 hover:border-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Wallet size={20} className={paymentMethod === "KHALTI" ? "text-purple-400" : "text-gray-400"} />
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="KHALTI"
                                            checked={paymentMethod === "KHALTI"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="accent-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs block text-white">Khalti</span>
                                        <span className="text-[10px] text-purple-400 font-medium">Digital Wallet</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={orderLoading}
                            onClick={handlePlaceOrder}
                            className="w-full bg-btn text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-btn/30 hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {orderLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Placing Order...</span>
                                </>
                            ) : (
                                <span>Proceed & Place Order (Rs. {grandTotal})</span>
                            )}
                        </button>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-card/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-6 shadow-2xl sticky top-6">
                            <h3 className="text-lg font-extrabold tracking-tight text-white mb-4 flex items-center gap-2">
                                <ShoppingBag size={18} className="text-btn" />
                                Order Summary ({cartItems?.length || 0})
                            </h3>

                            <div className="space-y-3 max-h-56 overflow-y-auto mb-4 pr-1">
                                {cartItems?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-xs text-gray-300">
                                        <span className="truncate max-w-[160px]">{item.food?.name} x {item.quantity}</span>
                                        <span className="font-semibold text-white">Rs. {(item.food?.price || 0) * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2.5 text-xs py-4 border-t border-b border-gray-800 text-gray-300 font-medium">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-white">Rs. {totalAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Fee</span>
                                    <span className="text-white">Rs. {deliveryFee}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <span className="font-bold text-sm text-gray-200">Grand Total</span>
                                <span className="text-btn text-xl font-black">Rs. {grandTotal}</span>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mt-6 pt-4 border-t border-gray-800/60">
                                <ShieldCheck size={16} className="text-btn shrink-0" />
                                <span>Secure Transactions Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
