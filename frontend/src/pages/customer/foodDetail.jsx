import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingBag, Plus, Minus, ShieldCheck, Clock, Flame, Loader2, Utensils } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function FoodDetail() {
    const { slug } = useParams(); // Changed from id to slug to match your router
    const navigate = useNavigate();

    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('Regular');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchFoodDetail = async () => {
            try {
                setLoading(true);
                // Connected to your backend route: GET /single/:slug
                const res = await axiosInstance.get(`/food/single/${slug}`);
                setFood(res.data.food || res.data);
            } catch (error) {
                console.log('Fetch Food Detail Error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchFoodDetail();
        }
    }, [slug]);

    const handleAddToCart = async () => {
        try {
            setSubmitting(true);
            await axiosInstance.post('/cart/add', {
                foodId: food?._id || food?.id,
                quantity,
                size: selectedSize,
                specialInstructions,
            });
            setSuccessMessage('Item successfully added to your cart!');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.log('Add to Cart Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] bg-primary text-white flex flex-col items-center justify-center">
                <Loader2 size={42} className="animate-spin text-btn mb-4" />
                <p className="text-gray-400 text-sm font-medium">Preparing delicious details...</p>
            </div>
        );
    }

    if (!food) {
        return (
            <div className="min-h-[80vh] bg-primary text-white flex flex-col items-center justify-center px-5">
                <h2 className="text-2xl font-bold mb-4">Dish not found</h2>
                <Link
                    to="/restaurant"
                    className="bg-btn text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-95 transition-all"
                >
                    Back to Restaurants
                </Link>
            </div>
        );
    }

    const basePrice = food.price || 0;
    const sizeMultiplier = selectedSize === 'Large' ? 1.3 : selectedSize === 'Medium' ? 1.15 : 1;
    const finalPrice = Math.round(basePrice * sizeMultiplier * quantity);

    return (
        <div className="min-h-screen bg-primary text-white py-10 px-5 md:px-10 selection:bg-btn selection:text-white">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold mb-8 bg-card/60 border border-gray-800 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>

                {/* Success Banner */}
                {successMessage && (
                    <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-4 rounded-2xl flex items-center justify-between animate-fade-in">
                        <span className="font-semibold text-sm">{successMessage}</span>
                        <Link to="/cart" className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
                            View Cart
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-card/70 backdrop-blur-2xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    {/* Food Image Container */}
                    <div className="relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden bg-primary border border-gray-800 shadow-inner group">
                        <img
                            src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                            alt={food.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        {food.category && (
                            <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-btn border border-white/10 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                                {food.category.name || food.category}
                            </span>
                        )}

                        {food.rating && (
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-emerald-400 border border-white/10 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                <Star size={14} fill="currentColor" />
                                <span>{food.rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Food Details & Customization */}
                    <div className="flex flex-col justify-between">
                        <div>
                            {food.restaurant && (
                                <Link
                                    to={`/restaurant/${food.restaurant._id || food.restaurant}`}
                                    className="text-xs font-bold text-btn uppercase tracking-wider hover:underline flex items-center gap-1 mb-1"
                                >
                                    <Utensils size={13} />
                                    <span>{food.restaurant.name || 'Explore Restaurant'}</span>
                                </Link>
                            )}

                            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">{food.name}</h1>
                            <p className="text-gray-400 text-sm mt-3 leading-relaxed font-medium">
                                {food.description || 'A mouthwatering specialty dish prepared with fresh ingredients, exotic spices, and authentic local recipes.'}
                            </p>

                            {/* Perks badges */}
                            <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-gray-300 font-medium border-y border-gray-800/80 py-4">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} className="text-btn" />
                                    <span>20-30 mins delivery</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck size={16} className="text-btn" />
                                    <span>Hygienic Packaging</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Flame size={16} className="text-btn" />
                                    <span>Freshly Cooked</span>
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="mt-6">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Choose Portion / Size</label>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {['Regular', 'Medium', 'Large'].map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setSelectedSize(size)}
                                            className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${selectedSize === size
                                                    ? 'bg-btn text-white border-btn shadow-lg shadow-btn/30'
                                                    : 'bg-primary border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="mt-5">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Special Instructions (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Make it extra spicy, no onions please..."
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    className="w-full bg-primary border border-gray-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-btn transition-colors"
                                />
                            </div>
                        </div>

                        {/* Quantity and Checkout Bar */}
                        <div className="pt-6 mt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 bg-primary border border-gray-700/80 rounded-xl p-1.5 shadow-inner w-full sm:w-auto justify-center">
                                <button
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    className="w-9 h-9 rounded-lg bg-card text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-extrabold text-base w-8 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(prev => prev + 1)}
                                    className="w-9 h-9 rounded-lg bg-card text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Total Price</span>
                                    <span className="font-black text-btn text-2xl">Rs. {finalPrice}</span>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={submitting}
                                    className="bg-btn text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-btn/30 hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}