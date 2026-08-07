import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Truck, ShieldCheck, Clock, ArrowRight, Utensils, ChevronLeft, ChevronRight, Flame, Sparkles, Heart, ShoppingBag, Check } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function Home() {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState('');
    const [categories, setCategories] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState({});

    // Add to Cart states per food item
    const [submittingId, setSubmittingId] = useState(null);
    const [addedIds, setAddedIds] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Slider Refs for smooth horizontal scrolling
    const categorySliderRef = useRef(null);
    const restaurantSliderRef = useRef(null);
    const foodSliderRef = useRef(null);

    const scrollSlider = (ref, direction) => {
        if (ref.current) {
            const { scrollLeft, clientWidth } = ref.current;
            const scrollAmount = clientWidth * 0.75;
            ref.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const fetchHomeData = async () => {
        try {
            const [categoryRes, restaurantRes, foodRes] = await Promise.all([
                axiosInstance.get('/categories/all'),
                axiosInstance.get('/search/popular-resturants'),
                axiosInstance.get('/search/popular-foods'),
            ]);
            setCategories(categoryRes.data.categories || []);
            setRestaurants(restaurantRes.data.restaurant || []);
            setFoods(foodRes.data.foods || []);
        } catch (error) {
            console.log('Home Data Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        navigate(`/restaurant?keyword=${encodeURIComponent(keyword)}`);
    };

    const toggleFavorite = (id, e) => {
        e.preventDefault();
        setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAddToCart = async (foodId, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setSubmittingId(foodId);
            await axiosInstance.post('/cart/add', {
                foodId,
                quantity: 1,
            });

            setAddedIds(prev => ({ ...prev, [foodId]: true }));
            window.dispatchEvent(new Event('cart:updated'));
            setSuccessMessage('Item successfully added to your cart!');

            setTimeout(() => {
                setAddedIds(prev => ({ ...prev, [foodId]: false }));
                setSuccessMessage('');
            }, 2500);
        } catch (error) {
            console.error('Add to Cart Error:', error);
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-primary text-white selection:bg-btn selection:text-white overflow-x-hidden">
            {/* Unique Loader State */}
            {loading ? (
                <div className="min-h-screen bg-primary flex flex-col items-center justify-center relative overflow-hidden px-5">
                    <div className="absolute w-[500px] h-[500px] bg-btn/15 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-btn border-t-transparent animate-spin"></div>
                            <Utensils size={32} className="text-btn animate-bounce" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2 justify-center">
                                <Sparkles size={18} className="text-btn animate-spin" />
                                <span>Preparing your feast...</span>
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">Fetching top local tastes and secret recipes for you</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Success Notification Banner */}
                    {successMessage && (
                        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-5 animate-fade-in">
                            <div className="bg-card/95 backdrop-blur-2xl border border-emerald-500/40 text-emerald-400 px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-2xl">
                                <span className="font-semibold text-xs sm:text-sm">{successMessage}</span>
                                <Link to="/cart" className="bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl hover:opacity-90 transition-opacity">
                                    View Cart
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Hero Section */}
                    <section className="relative overflow-hidden bg-card border-b border-gray-800/80 py-24 md:py-36 px-5">
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-btn/15 blur-[160px] rounded-full pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 blur-[140px] rounded-full pointer-events-none"></div>

                        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
                            <span className="inline-flex items-center gap-2 bg-btn/10 text-btn text-xs md:text-sm font-semibold px-4 py-2 rounded-full border border-btn/20 backdrop-blur-xl shadow-lg shadow-btn/5 animate-fade-in">
                                <Sparkles size={15} className="animate-spin" />
                                Lightning-Fast Food Delivery Service
                            </span>

                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1]">
                                Satisfy your cravings, delivered <span className="text-btn drop-shadow-[0_0_35px_rgba(var(--btn),0.4)]">swiftly</span> to your door.
                            </h1>
                            <p className="text-gray-400 text-base md:text-xl max-w-2xl font-normal leading-relaxed">
                                Explore handpicked menus from top local restaurants, authentic traditional flavors, and midnight snacks.
                            </p>

                            <form
                                onSubmit={handleSearch}
                                className="w-full max-w-2xl flex items-center bg-primary/90 backdrop-blur-2xl border border-gray-700/80 rounded-2xl p-2.5 shadow-2xl focus-within:border-btn focus-within:ring-4 focus-within:ring-btn/20 transition-all duration-300 mt-2"
                            >
                                <Search className="text-gray-400 ml-4 shrink-0" size={22} />
                                <input
                                    type="text"
                                    placeholder="Search for restaurants, cuisines, or favorite dishes..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none text-sm md:text-base font-medium"
                                />
                                <button
                                    type="submit"
                                    className="bg-btn text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0 shadow-lg shadow-btn/30 flex items-center gap-2"
                                >
                                    <span>Search</span>
                                    <ArrowRight size={16} />
                                </button>
                            </form>

                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-gray-400">
                                <span className="text-gray-500 font-medium">Trending searches:</span>
                                {['Momos', 'Pizza', 'Burger', 'Biryani', 'Coffee'].map((tag, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setKeyword(tag);
                                            navigate(`/restaurant?keyword=${encodeURIComponent(tag)}`);
                                        }}
                                        className="bg-card/80 hover:bg-btn/20 hover:text-btn border border-gray-800 hover:border-btn/40 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section className="max-w-7xl mx-auto px-5 -mt-8 relative z-20">
                        <div className="bg-card/90 backdrop-blur-2xl border border-gray-800 p-6 rounded-3xl shadow-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: Truck, title: 'Superfast Delivery', desc: 'Hot & fresh meals at your door' },
                                { icon: ShieldCheck, title: '100% Secure & Hygienic', desc: 'Safe packaging protocols' },
                                { icon: Clock, title: 'Live Order Tracking', desc: 'Real-time rider updates' },
                                { icon: Utensils, title: 'Premium Quality', desc: 'Curated top-rated local chefs' },
                            ].map((item, idx) => {
                                const IconComponent = item.icon;
                                return (
                                    <div key={idx} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-white/[0.02] transition-colors">
                                        <div className="bg-btn/10 p-3.5 rounded-2xl text-btn group-hover:scale-110 group-hover:bg-btn group-hover:text-white transition-all duration-300 shadow-inner">
                                            <IconComponent size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm md:text-base">{item.title}</h3>
                                            <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Categories Slider */}
                    <section className="max-w-7xl mx-auto px-5 py-16 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-btn/5 blur-[120px] rounded-full pointer-events-none"></div>

                        <div className="flex justify-between items-end mb-8 relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3 border border-btn/20">
                                    <span className="w-2 h-2 rounded-full bg-btn animate-pulse"></span>
                                    Categories
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">Inspiration for your first order</h2>
                                <p className="text-gray-400 text-sm md:text-base mt-1.5">Browse through popular food categories and exotic cuisines</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <button
                                    onClick={() => scrollSlider(categorySliderRef, 'left')}
                                    className="p-3.5 rounded-2xl bg-card border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-btn/10 transition-all cursor-pointer shadow-lg active:scale-95"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => scrollSlider(categorySliderRef, 'right')}
                                    className="p-3.5 rounded-2xl bg-card border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-btn/10 transition-all cursor-pointer shadow-lg active:scale-95"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {categories.length === 0 ? (
                            <div className="text-gray-500 py-12 text-center font-medium bg-card/40 rounded-3xl border border-gray-800">No categories found.</div>
                        ) : (
                            <div
                                ref={categorySliderRef}
                                className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-6 pt-2 px-1 relative z-10"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {categories.map((cat) => (
                                    <Link
                                        key={cat._id || cat.id}
                                        to={`/restaurant?category=${cat.name}`}
                                        className="min-w-[160px] sm:min-w-[185px] h-[220px] sm:h-[250px] relative overflow-hidden rounded-3xl bg-card border border-gray-800 hover:border-btn/80 group shrink-0 flex flex-col justify-end p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
                                    >
                                        <div className="absolute inset-0 z-0 overflow-hidden">
                                            <img
                                                src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                                alt={cat.name}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center text-center w-full">
                                            <span className="font-bold text-base sm:text-lg text-white group-hover:text-btn transition-colors tracking-wide drop-shadow-md truncate w-full">
                                                {cat.name}
                                            </span>
                                            <span className="text-xs text-gray-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Explore options &rarr;</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Popular Restaurants Slider */}
                    <section className="max-w-7xl mx-auto px-5 py-16 relative overflow-hidden">
                        <div className="absolute top-1/3 right-10 w-96 h-96 bg-btn/5 blur-[120px] rounded-full pointer-events-none"></div>

                        <div className="flex justify-between items-end mb-8 relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3 border border-btn/20">
                                    <Flame size={14} className="text-btn animate-bounce" />
                                    Top Spots
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">Popular Restaurants</h2>
                                <p className="text-gray-400 text-sm md:text-base mt-1.5">Top-rated dining spots and cloud kitchens around you</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to="/restaurant" className="text-btn text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:underline mr-2 bg-btn/10 px-4 py-2 rounded-xl border border-btn/20">
                                    <span>See All</span> <ArrowRight size={16} />
                                </Link>
                                <div className="hidden sm:flex items-center gap-2">
                                    <button
                                        onClick={() => scrollSlider(restaurantSliderRef, 'left')}
                                        className="p-3.5 rounded-2xl bg-card border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-btn/10 transition-all cursor-pointer shadow-lg active:scale-95"
                                        aria-label="Scroll left"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => scrollSlider(restaurantSliderRef, 'right')}
                                        className="p-3.5 rounded-2xl bg-card border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-btn/10 transition-all cursor-pointer shadow-lg active:scale-95"
                                        aria-label="Scroll right"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {restaurants.length === 0 ? (
                            <div className="text-gray-500 py-12 text-center font-medium bg-card/40 rounded-3xl border border-gray-800">No popular restaurants available.</div>
                        ) : (
                            <div
                                ref={restaurantSliderRef}
                                className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-6 pt-2 px-1 relative z-10"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {restaurants.map((res) => {
                                    const resId = res._id || res.id;
                                    const isFav = favorites[resId];
                                    return (
                                        <Link
                                            key={resId}
                                            to={`/restaurant/${resId}`}
                                            className="min-w-[290px] sm:min-w-[330px] max-w-[330px] bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-2xl border border-gray-800/90 rounded-3xl overflow-hidden hover:border-btn/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 group shrink-0 flex flex-col hover:-translate-y-2"
                                        >
                                            <div className="h-52 w-full overflow-hidden bg-primary relative">
                                                <img
                                                    src={res.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'}
                                                    alt={res.name}
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                
                                                <button 
                                                    onClick={(e) => toggleFavorite(resId, e)}
                                                    className="absolute top-4 left-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors border border-white/10"
                                                >
                                                    <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : "text-white"} />
                                                </button>

                                                {res.rating && (
                                                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-emerald-400 text-xs font-extrabold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-white/10 shadow-xl">
                                                        <Star size={13} fill="currentColor" /> {res.rating}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 flex flex-col gap-2">
                                                <h3 className="font-bold text-lg text-white group-hover:text-btn transition-colors truncate">{res.name}</h3>
                                                <p className="text-gray-400 text-xs truncate font-medium flex items-center gap-1.5">
                                                    <Utensils size={13} className="text-btn shrink-0" />
                                                    <span>{res.cuisines?.join(', ') || res.address}</span>
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Popular Foods Slider with Direct Add to Cart */}
                    <section className="max-w-7xl mx-auto px-5 py-16 mb-16 relative overflow-hidden">
                        <div className="absolute bottom-10 left-10 w-96 h-96 bg-btn/5 blur-[120px] rounded-full pointer-events-none"></div>

                        <div className="flex justify-between items-end mb-8 relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3 border border-btn/20">
                                    <Sparkles size={14} className="text-btn" />
                                    Trending Cravings
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">Popular Dishes</h2>
                                <p className="text-gray-400 text-sm md:text-base mt-1.5">Most ordered meals right now by food lovers</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => scrollSlider(foodSliderRef, 'left')}
                                    className="p-3.5 rounded-2xl bg-card border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-btn/10 transition-all cursor-pointer shadow-lg active:scale-95"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => scrollSlider(foodSliderRef, 'right')}
                                    className="p-3.5 rounded-2xl bg-card border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-btn/10 transition-all cursor-pointer shadow-lg active:scale-95"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {foods.length === 0 ? (
                            <div className="text-gray-500 py-12 text-center font-medium bg-card/40 rounded-3xl border border-gray-800">No popular dishes available.</div>
                        ) : (
                            <div
                                ref={foodSliderRef}
                                className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-6 pt-2 px-1 relative z-10"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {foods.map((foodItem) => {
                                    const foodId = foodItem._id || foodItem.id;
                                    const isFav = favorites[foodId];
                                    const isSubmitting = submittingId === foodId;
                                    const isAdded = addedIds[foodId];

                                    return (
                                        <div
                                            key={foodId}
                                            className="min-w-[280px] sm:min-w-[305px] max-w-[305px] bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-2xl border border-gray-800/90 rounded-3xl overflow-hidden flex flex-col justify-between shrink-0 shadow-2xl group hover:border-btn/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2"
                                        >
                                            <div className="h-52 w-full overflow-hidden bg-primary relative">
                                                <img
                                                    src={foodItem.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'}
                                                    alt={foodItem.name}
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                
                                                <button 
                                                    onClick={(e) => toggleFavorite(foodId, e)}
                                                    className="absolute top-4 left-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors border border-white/10"
                                                >
                                                    <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : "text-white"} />
                                                </button>
                                            </div>

                                            <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                                                <div>
                                                    <h3 className="font-bold text-white text-base sm:text-lg truncate group-hover:text-btn transition-colors">{foodItem.name}</h3>
                                                    <p className="text-gray-400 text-xs line-clamp-2 mt-1 font-medium leading-relaxed">{foodItem.description}</p>
                                                </div>

                                                <div className="flex justify-between items-center pt-3 border-t border-gray-800/80 mt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-semibold text-gray-500">Price</span>
                                                        <span className="font-extrabold text-btn text-lg tracking-tight">Rs. {foodItem.price}</span>
                                                    </div>

                                                    <button
                                                        onClick={(e) => handleAddToCart(foodId, e)}
                                                        disabled={isSubmitting}
                                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 flex items-center gap-1.5 shadow-lg cursor-pointer disabled:opacity-50 ${
                                                            isAdded
                                                                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                                                : 'bg-btn text-white shadow-btn/30 hover:opacity-95'
                                                        }`}
                                                    >
                                                        {isSubmitting ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        ) : isAdded ? (
                                                            <Check size={14} />
                                                        ) : (
                                                            <ShoppingBag size={14} />
                                                        )}
                                                        <span>{isAdded ? 'Added' : 'Add to Cart'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}