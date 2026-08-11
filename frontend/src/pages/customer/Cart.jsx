import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Tag, Loader2, ReceiptText } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    // Fetch user cart from backend without triggering destructive layout re-loads
    const fetchCart = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const response = await axiosInstance.get('/cart');
            // Prisma returns { success, totalItems, totalAmount, items: [...] }
            setCart(response.data);
        } catch (error) {
            console.log('Fetch Cart Error:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart(true);

        const handleCartUpdated = () => fetchCart(false);
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
            await axiosInstance.put(`/cart/update/${itemId}`, { quantity: newQuantity });
            // Re-fetch clean cart state from Prisma API
            await fetchCart(false);
        } catch (error) {
            console.log('Update Quantity Error:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    // Remove single item from cart
    const removeItem = async (itemId) => {
        if (!itemId) {
            console.error('Remove Item Error: Item ID is undefined.');
            return;
        }
        try {
            setUpdatingId(itemId);
            await axiosInstance.delete(`/cart/remove/${itemId}`);
            await fetchCart(false);
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
            setCouponError('Invalid coupon code. Try entering "FIRST50"');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] bg-primary text-white flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-btn mb-4" />
                <p className="text-gray-300 text-base font-medium">Getting your food bag ready...</p>
            </div>
        );
    }

    // Prisma items array
    const items = cart?.items || [];
    const itemsTotal = cart?.totalAmount || 0;
    const deliveryFee = items.length > 0 ? 100 : 0;
    const total = Math.max(0, itemsTotal + deliveryFee - discount);

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] bg-primary text-white flex flex-col items-center justify-center px-5 py-16">
                <div className="w-24 h-24 rounded-full bg-card border border-gray-800 flex items-center justify-center text-btn mb-6 shadow-2xl animate-bounce">
                    <ShoppingBag size={42} />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white mb-2">Your food basket is empty</h2>
                <p className="text-gray-300 text-sm max-w-sm text-center mb-8">
                    Looks like you haven't added anything delicious yet. Let's find something tasty for you!
                </p>
                <Link
                    to="/restaurant"
                    className="bg-btn text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-btn/30 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span>Explore Restaurants</span>
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
                            Easy & Secure Order
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Review Your Food Basket</h1>
                    </div>
                    <Link
                        to="/restaurant"
                        className="text-gray-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors self-start md:self-auto bg-card/60 px-4 py-2.5 rounded-xl border border-gray-800"
                    >
                        <ArrowLeft size={16} />
                        <span>Add more food items</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                            <ShoppingBag size={18} className="text-btn" />
                            Selected Food Items ({items.length})
                        </h2>

                        {items.map((cartItem, index) => {
                            // Prisma relations: cartItem has id, quantity, and nested food object
                            const itemId = cartItem.id;
                            const food = cartItem.food || {};
                            const name = food.name || 'Delicious Item';
                            const price = food.price || 0;
                            const image = food.image;
                            const restaurantName = food.restaurant?.name;
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
                                                    <span className="text-xs font-semibold text-btn uppercase tracking-wider">{restaurantName}</span>
                                                )}
                                                <h3 className="font-bold text-lg text-white mt-0.5">{name}</h3>
                                            </div>
                                            <button
                                                onClick={() => removeItem(itemId)}
                                                className="text-gray-400 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                                                title="Remove item"
                                            >
                                                <Trash2 size={16} />
                                                <span className="hidden sm:inline">Remove</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div>
                                                <span className="text-xs text-gray-400 block">Total Price</span>
                                                <span className="font-extrabold text-btn text-base sm:text-lg">
                                                    Rs. {price * cartItem.quantity}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 bg-primary/80 border border-gray-700/80 rounded-xl p-1.5 shadow-inner">
                                                <button
                                                    onClick={() => updateQuantity(itemId, cartItem.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg bg-card text-gray-200 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                                    title="Decrease quantity"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold text-base w-6 text-center text-white">{cartItem.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(itemId, cartItem.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg bg-card text-gray-200 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                                    title="Increase quantity"
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

                    {/* Bill Statement & Checkout Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-card/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-6 shadow-2xl sticky top-6">
                            <h3 className="text-xl font-extrabold tracking-tight text-white mb-4 flex items-center gap-2">
                                <ReceiptText size={20} className="text-btn" />
                                Official Bill Statement
                            </h3>
                            <p className="text-xs text-gray-300 mb-6">Detailed cost breakdown of all items ordered.</p>

                            {/* Coupon Form */}
                            <form onSubmit={applyCoupon} className="mb-6">
                                <label className="block text-xs font-semibold text-gray-300 mb-2">Have a Promo Code?</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Try typing FIRST50"
                                            value={coupon}
                                            onChange={(e) => setCoupon(e.target.value)}
                                            className="w-full bg-primary border border-gray-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-btn transition-colors"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-btn/25 text-btn border border-btn/40 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-btn hover:text-white transition-all cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && <p className="text-red-400 text-xs mt-1.5">{couponError}</p>}
                                {discount > 0 && <p className="text-emerald-400 text-xs mt-1.5 font-medium">✨ Discount coupon successfully applied! (-Rs. {discount})</p>}
                            </form>

                            {/* Itemized Bill List */}
                            <div className="space-y-3 text-sm pb-6 border-b border-gray-800 font-medium">
                                <div className="flex justify-between text-gray-300">
                                    <span>Total Price of Customer Items</span>
                                    <span className="text-white font-semibold">Rs. {itemsTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Safe Home Delivery Fee</span>
                                    <span className="text-white font-semibold">Rs. {deliveryFee}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Promo Discount Savings</span>
                                        <span>-Rs. {discount}</span>
                                    </div>
                                )}
                            </div>

                            {/* Grand Total Section */}
                            <div className="bg-primary/60 border border-gray-800 rounded-2xl p-4 my-5 flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-gray-400 block font-medium">Total Payable Amount</span>
                                    <span className="text-xs text-gray-300">Includes all taxes & fees</span>
                                </div>
                                <span className="text-btn text-2xl font-black">Rs. {total}</span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-btn text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-btn/30 hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mb-4"
                            >
                                <span>Proceed to Secure Checkout</span>
                                <ArrowRight size={18} />
                            </button>

                            <div className="flex items-center justify-center gap-2 text-gray-300 text-xs pt-2">
                                <ShieldCheck size={16} className="text-btn shrink-0" />
                                <span>100% Secure Checkout & Hygienic Delivery Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}