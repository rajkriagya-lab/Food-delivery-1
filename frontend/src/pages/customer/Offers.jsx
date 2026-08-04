import React, { useEffect, useState } from 'react';
import { Tag, Clock, Sparkles, Copy, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function Offers() {
    const [offers, setOffers] = useState([]);
    const [savedCoupons, setSavedCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState('');

    useEffect(() => {
        const fetchOffersAndSaved = async () => {
            try {
                // Fetch all active offers from backend
                const offersRes = await axiosInstance.get('/offers/all');
                setOffers(offersRes.data.offers || []);

                // Fetch user's profile/saved coupons from backend
                const userRes = await axiosInstance.get('/auth/profile');
                const userSaved = userRes.data.user?.savedCoupons || [];
                
                // Map saved coupons assuming backend returns populated coupon objects or IDs
                setSavedCoupons(userSaved);
            } catch (error) {
                console.error('Error fetching offers data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffersAndSaved();
    }, []);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => {
            setCopiedCode('');
        }, 2000);
    };

    const toggleSaveCoupon = async (couponId) => {
        try {
            const res = await axiosInstance.post('/offers/save', { couponId });
            
            // Re-fetch user profile or update state dynamically based on response
            if (res.data.saved) {
                const addedCoupon = offers.find(o => o.id === couponId || o._id === couponId);
                if (addedCoupon) {
                    setSavedCoupons(prev => [...prev, addedCoupon]);
                }
            } else {
                setSavedCoupons(prev => prev.filter(c => (c.id || c._id) !== couponId));
            }
        } catch (error) {
            console.error('Error toggling coupon save state:', error);
            alert('Failed to update saved coupon. Please make sure you are logged in.');
        }
    };

    return (
        <div className="min-h-screen bg-primary text-white selection:bg-btn selection:text-white pb-20">
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-card border-b border-gray-800 py-16 px-5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-btn/10 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-4 relative z-10">
                    <span className="inline-flex items-center gap-2 bg-btn/10 text-btn text-xs font-medium px-4 py-1.5 rounded-full border border-btn/20">
                        <Sparkles size={14} /> Special Discounts & Promos
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                        Exciting <span className="text-btn">Offers</span> For You
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base max-w-xl">
                        Save coupons securely to your account wallet or copy codes directly for checkout.
                    </p>
                </div>
            </div>

            {/* Saved Coupons Wallet Section */}
            {savedCoupons.length > 0 && (
                <div className="max-w-7xl mx-auto px-5 mt-10">
                    <div className="bg-card/50 border border-btn/30 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <BookmarkCheck size={20} className="text-btn" /> Your Saved Coupon Wallet ({savedCoupons.length})
                            </h3>
                            <span className="text-xs text-gray-400 font-medium">Synced with your account</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {savedCoupons.map((coupon) => {
                                const couponId = coupon.id || coupon._id;
                                return (
                                    <div key={couponId} className="bg-primary border border-gray-800 p-4 rounded-xl flex items-center justify-between gap-3 shadow-md">
                                        <div className="overflow-hidden">
                                            <span className="bg-btn/20 text-btn text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : coupon.discountType === 'fixed' ? `Rs. ${coupon.discountValue} OFF` : 'Free Delivery'}
                                            </span>
                                            <h4 className="font-bold text-sm text-white truncate mt-1">{coupon.code}</h4>
                                            <p className="text-[11px] text-gray-400 truncate">{coupon.title}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopyCode(coupon.code)}
                                            className="bg-card hover:bg-btn text-gray-300 hover:text-white p-2 rounded-lg transition-all text-xs font-semibold shrink-0 border border-gray-700 cursor-pointer"
                                            title="Copy code"
                                        >
                                            {copiedCode === coupon.code ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-5 mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Tag size={20} className="text-btn" /> Active Coupons & Deals
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium">
                        <span className="text-white font-bold">{offers.length}</span> offers available
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-10">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-card/50 border border-gray-800 rounded-2xl h-48 animate-pulse flex">
                                <div className="w-1/3 bg-gray-800/80 rounded-l-2xl"></div>
                                <div className="w-2/3 p-5 flex flex-col justify-between">
                                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-800 rounded w-full"></div>
                                    <div className="h-8 bg-gray-800 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : offers.length === 0 ? (
                    <div className="bg-card border border-gray-800 rounded-2xl py-20 text-center flex flex-col items-center justify-center gap-3 mt-4">
                        <Tag size={32} className="text-gray-500" />
                        <h3 className="text-base font-bold text-white">No active offers right now</h3>
                        <p className="text-gray-400 text-xs">Check back later for exciting discounts and promo deals!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {offers.map((offer) => {
                            const couponId = offer.id || offer._id;
                            const isCopied = copiedCode === offer.code;
                            const isSaved = savedCoupons.some(c => (c.id || c._id) === couponId || c.code === offer.code);
                            
                            const discountBadgeText = offer.discountType === 'percentage' 
                                ? `${offer.discountValue}% OFF` 
                                : offer.discountType === 'fixed' 
                                ? `Rs. ${offer.discountValue} OFF` 
                                : 'FREE DELIVERY';

                            return (
                                <div 
                                    key={couponId}
                                    className="bg-card/80 border border-gray-800/80 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-btn/60 transition-all shadow-xl group"
                                >
                                    {/* Badge / Graphic section */}
                                    <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-gray-900 flex items-center justify-center p-6 text-center border-r border-gray-800">
                                        <div className="absolute inset-0 bg-btn/5 group-hover:bg-btn/10 transition-colors"></div>
                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-btn/20 border border-btn/30 text-btn flex items-center justify-center shadow-lg">
                                                <Tag size={22} />
                                            </div>
                                            <span className="bg-btn text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg uppercase tracking-wider">
                                                {discountBadgeText}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details section */}
                                    <div className="sm:w-3/5 p-5 flex flex-col justify-between gap-3">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="font-bold text-base text-white group-hover:text-btn transition-colors">
                                                    {offer.title}
                                                </h3>
                                                <button
                                                    onClick={() => toggleSaveCoupon(couponId)}
                                                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                        isSaved 
                                                            ? 'bg-btn text-white shadow-md shadow-btn/20' 
                                                            : 'bg-primary border border-gray-700 text-gray-400 hover:text-white'
                                                    }`}
                                                    title={isSaved ? "Saved in wallet" : "Save coupon for later"}
                                                >
                                                    {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                                </button>
                                            </div>
                                            <p className="text-gray-400 text-xs font-normal leading-relaxed">
                                                {offer.description || `Minimum order value: Rs. ${offer.minOrderValue || 0}`}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                <Clock size={12} className="text-btn" /> 
                                                {offer.expiryDate ? `Expires: ${new Date(offer.expiryDate).toLocaleDateString()}` : 'Limited time'}
                                            </div>

                                            {offer.code && (
                                                <button
                                                    onClick={() => handleCopyCode(offer.code)}
                                                    className="flex items-center gap-1.5 bg-primary border border-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-white hover:border-btn transition-all cursor-pointer active:scale-95"
                                                >
                                                    {isCopied ? (
                                                        <>
                                                            <Check size={14} className="text-green-400" />
                                                            <span className="text-green-400">Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={14} className="text-btn" />
                                                            <span>{offer.code}</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}