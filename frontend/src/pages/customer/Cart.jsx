import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Tag, Loader2 } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    // Fetch user cart from backend
    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/cart');
            setCart(response.data.cart || response.data);
        } catch (error) {
            console.log('Fetch Cart Error:', error);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();

        const handleCartUpdated = () => fetchCart();
        window.addEventListener('cart:updated', handleCartUpdated);

        return () => window.removeEventListener('cart:updated', handleCartUpdated);
    }, []);

    // Update item quantity
    const updateQuantity = async (itemId, newQuantity) => {
        if (!itemId) {
            console.error('Update Quantity Error: Item ID is undefined');
            return;
        }
        if (newQuantity <= 0) {
            removeItem(itemId);
            return;
        }
        try {
            setUpdatingId(itemId);
            const response = await axiosInstance.put(`/cart/update/${itemId}`, { quantity: newQuantity });
            setCart(response.data.cart || response.data);
        } catch (error) {
            console.log('Update Quantity Error:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    // Remove single item from cart
    const removeItem = async (itemId) => {
        if (!itemId) {
            console.error('Remove Item Error: Item ID is undefined. Check your cart item schema keys.');
            return;
        }
        try {
            setUpdatingId(itemId);
            const response = await axiosInstance.delete(`/cart/remove/${itemId}`);
            setCart(response.data.cart || response.data);
        } catch (error) {
            console.log('Remove Item Error:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    // Apply Coupon
    const applyCoupon = (e) => {
        e.preventDefault();
        if (coupon.trim().toUpperCase() === 'FIRST50') {
            setDiscount(100);
            setCouponError('');
        } else {
            setCouponError('Invalid coupon code. Try "FIRST50"');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] bg-primary text-white flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-btn mb-4" />
                <p className="text-gray-400 text-sm font-medium">Loading your cart...</p>
            </div>
        );
    }

    const items = cart?.items || cart?.cartItems || [];
    const subtotal = cart?.subtotal || items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = items.length > 0 ? (cart?.deliveryFee || 100) : 0;
    const total = Math.max(0, subtotal + deliveryFee - discount);

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] bg-primary text-white flex flex-col items-center justify-center px-5 py-16">
                <div className="w-24 h-24 rounded-full bg-card border border-gray-800 flex items-center justify-center text-btn mb-6 shadow-2xl animate-bounce">
                    <ShoppingBag size={42} />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white mb-2">Your cart is empty</h2>
                <p className="text-gray-400 text-sm max-w-sm text-center mb-8">
                    Good food is always just a few clicks away. Explore our top restaurants and add something delicious!
                </p>
                <Link
                    to="/restaurant"
                    className="bg-btn text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-btn/30 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span>Browse Restaurants</span>
                    <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary text-white py-12 px-5 md:px-10 selection:bg-btn selection:text-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-800/80">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-semibold px-3.5 py-1.5 rounded-full mb-2 border border-btn/25">
                            <Sparkles size={14} className="animate-spin" />
                            Review Order
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Your Shopping Cart</h1>
                    </div>
                    <Link
                        to="/restaurant"
                        className="text-gray-400 hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors self-start md:self-auto bg-card/60 px-4 py-2 rounded-xl border border-gray-800"
                    >
                        <ArrowLeft size={16} />
                        <span>Add more items</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {items.map((item, index) => {
                            // Enhanced fallback check for object IDs across standard backend models
                            const itemId = item._id || item.id || item.food?._id || item.food?.id;
                            const name = item.name || item.food?.name || 'Delicious Item';
                            const price = item.price || item.food?.price || 0;
                            const image = item.image || item.food?.image;
                            const restaurantName = item.restaurantName || item.restaurant?.name;
                            const isUpdating = updatingId === itemId;

                            return (
                                <div
                                    key={itemId || index}
                                    className="bg-card/70 backdrop-blur-xl border border-gray-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 shadow-xl hover:border-gray-700 transition-all duration-300 group relative overflow-hidden"
                                >
                                    {isUpdating && (
                                        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                            <Loader2 size={24} className="animate-spin text-btn" />
                                        </div>
                                    )}

                                    <div className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-primary shrink-0 relative">
                                        <img
                                            src={image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                            alt={name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between w-full">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {restaurantName && (
                                                    <span className="text-xs font-medium text-btn uppercase tracking-wider">{restaurantName}</span>
                                                )}
                                                <h3 className="font-bold text-lg text-white mt-0.5">{name}</h3>
                                            </div>
                                            <button
                                                onClick={() => removeItem(itemId)}
                                                className="text-gray-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                                                title="Remove item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <span className="font-extrabold text-btn text-base sm:text-lg">
                                                Rs. {price * item.quantity}
                                            </span>

                                            <div className="flex items-center gap-3 bg-primary/80 border border-gray-700/80 rounded-xl p-1 shadow-inner">
                                                <button
                                                    onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg bg-card text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg bg-card text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary & Checkout Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-card/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-6 shadow-2xl sticky top-6">
                            <h3 className="text-xl font-extrabold tracking-tight text-white mb-6">Order Summary</h3>

                            {/* Coupon Form */}
                            <form onSubmit={applyCoupon} className="mb-6">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Promo Code (e.g., FIRST50)"
                                            value={coupon}
                                            onChange={(e) => setCoupon(e.target.value)}
                                            className="w-full bg-primary border border-gray-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-btn transition-colors"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-btn/20 text-btn border border-btn/30 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-btn hover:text-white transition-all cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && <p className="text-red-400 text-xs mt-1.5">{couponError}</p>}
                                {discount > 0 && <p className="text-emerald-400 text-xs mt-1.5 font-medium">Coupon applied successfully! (-Rs. {discount})</p>}
                            </form>

                            <div className="space-y-3.5 text-sm pb-6 border-b border-gray-800 font-medium">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-semibold">Rs. {subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Delivery Fee</span>
                                    <span className="text-white font-semibold">Rs. {deliveryFee}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Discount</span>
                                        <span>-Rs. {discount}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center py-6 font-black text-xl">
                                <span>Total Amount</span>
                                <span className="text-btn text-2xl">Rs. {total}</span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-btn text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-btn/30 hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mb-4"
                            >
                                <span>Proceed to Checkout</span>
                                <ArrowRight size={18} />
                            </button>

                            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs pt-2">
                                <ShieldCheck size={16} className="text-btn shrink-0" />
                                <span>Safe checkout & hygienic delivery guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}