import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Truck, ShieldCheck, Clock, ArrowRight, Utensils, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function Home() {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState('');
    const [categories, setCategories] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-primary text-white selection:bg-btn selection:text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-card border-b border-gray-800 py-20 md:py-32 px-5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-btn/10 blur-[140px] rounded-full pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
                    <span className="inline-flex items-center gap-2 bg-btn/10 text-btn text-xs md:text-sm font-medium px-4 py-1.5 rounded-full border border-btn/20 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-btn animate-pulse"></span>
                        Fastest Food Delivery Service
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                        Delicious food, delivered <span className="text-btn drop-shadow-[0_0_35px_rgba(var(--btn),0.3)]">fast</span> to your door.
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl font-normal">
                        Explore curated menus from top local restaurants, traditional authentic cuisines, and everyday cravings.
                    </p>

                    {/* Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className="w-full max-w-2xl flex items-center bg-primary/80 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-2 shadow-2xl focus-within:border-btn focus-within:ring-2 focus-within:ring-btn/20 transition-all duration-300"
                    >
                        <Search className="text-gray-400 ml-4 shrink-0" size={22} />
                        <input
                            type="text"
                            placeholder="Search for restaurants, cuisines, or dishes..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none text-sm md:text-base font-medium"
                        />
                        <button
                            type="submit"
                            className="bg-btn text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0 shadow-lg shadow-btn/20"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { icon: Truck, title: 'Fast Delivery', desc: 'Hot meals at your doorstep' },
                    { icon: ShieldCheck, title: 'Safe & Secure', desc: '100% hygienic packaging' },
                    { icon: Clock, title: 'Live Tracking', desc: 'Real-time order updates' },
                    { icon: Utensils, title: 'Best Quality', desc: 'Top-rated local chefs' },
                ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                        <div key={idx} className="bg-card/60 backdrop-blur-md border border-gray-800 p-5 rounded-2xl flex items-center gap-4 hover:border-gray-700 transition-colors group">
                            <div className="bg-btn/10 p-3 rounded-xl text-btn group-hover:scale-110 transition-transform duration-300">
                                <IconComponent size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                                <p className="text-gray-400 text-xs">{item.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Categories Slider */}
            <section className="max-w-7xl mx-auto px-5 py-12 relative overflow-hidden">
                {/* Subtle Background Glow */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-btn/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-semibold px-3 py-1 rounded-full mb-2 border border-btn/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-btn animate-pulse"></span>
                            Categories
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Inspiration for your first order</h2>
                        <p className="text-gray-400 text-sm mt-1">Browse through popular food categories and cuisines</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scrollSlider(categorySliderRef, 'left')}
                            className="p-3 rounded-2xl bg-card/80 border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-card transition-all cursor-pointer shadow-lg active:scale-95"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scrollSlider(categorySliderRef, 'right')}
                            className="p-3 rounded-2xl bg-card/80 border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-card transition-all cursor-pointer shadow-lg active:scale-95"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-btn"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-gray-500 py-10 text-center font-medium">No categories found.</div>
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
                                className="min-w-[150px] sm:min-w-[170px] h-[210px] sm:h-[230px] relative overflow-hidden rounded-3xl bg-card border border-gray-800/80 hover:border-btn/60 group shrink-0 flex flex-col justify-end p-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                            >
                                {/* Background Image with Gradient Overlay */}
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img
                                        src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                        alt={cat.name}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    {/* Multi-stop gradient overlay for deep dark contrast at the bottom */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                </div>

                                {/* Content Layer */}
                                <div className="relative z-10 flex flex-col items-center text-center w-full">
                                    <span className="font-bold text-sm sm:text-base text-white group-hover:text-btn transition-colors tracking-wide drop-shadow-md truncate w-full">
                                        {cat.name}
                                    </span>
                                    <div className="w-6 h-0.5 bg-btn rounded-full mt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-50 group-hover:scale-x-100"></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Popular Restaurants Slider */}
            <section className="max-w-7xl mx-auto px-5 py-12 relative overflow-hidden">
                {/* Subtle Background Glow */}
                <div className="absolute top-1/3 right-10 w-96 h-96 bg-btn/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-semibold px-3 py-1 rounded-full mb-2 border border-btn/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-btn animate-pulse"></span>
                            Top Spots
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Popular Restaurants</h2>
                        <p className="text-gray-400 text-sm mt-1">Top-rated dining spots around you</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/restaurant" className="text-btn text-xs sm:text-sm font-semibold flex items-center gap-1 hover:underline mr-2">
                            See All <ArrowRight size={16} />
                        </Link>
                        <button
                            onClick={() => scrollSlider(restaurantSliderRef, 'left')}
                            className="p-3 rounded-2xl bg-card/80 border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-card transition-all cursor-pointer shadow-lg active:scale-95"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scrollSlider(restaurantSliderRef, 'right')}
                            className="p-3 rounded-2xl bg-card/80 border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-card transition-all cursor-pointer shadow-lg active:scale-95"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-btn"></div>
                    </div>
                ) : restaurants.length === 0 ? (
                    <div className="text-gray-500 py-10 text-center font-medium">No popular restaurants available.</div>
                ) : (
                    <div
                        ref={restaurantSliderRef}
                        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-6 pt-2 px-1 relative z-10"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {restaurants.map((res) => (
                            <Link
                                key={res._id || res.id}
                                to={`/restaurant/${res._id || res.id}`}
                                className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-xl border border-gray-800/90 rounded-3xl overflow-hidden hover:border-btn/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 group shrink-0 flex flex-col hover:-translate-y-1.5"
                            >
                                <div className="h-52 w-full overflow-hidden bg-primary relative">
                                    <img
                                        src={res.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'}
                                        alt={res.name}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    {res.rating && (
                                        <div className="absolute top-3.5 right-3.5 bg-black/70 backdrop-blur-md text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1 border border-white/10 shadow-xl">
                                            <Star size={13} fill="currentColor" /> {res.rating}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col gap-1.5">
                                    <h3 className="font-bold text-lg text-white group-hover:text-btn transition-colors truncate">{res.name}</h3>
                                    <p className="text-gray-400 text-xs truncate font-medium">{res.cuisines?.join(', ') || res.address}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Popular Foods Slider */}
            <section className="max-w-7xl mx-auto px-5 py-12 mb-16 relative overflow-hidden">
                {/* Subtle Background Glow */}
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-btn/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-semibold px-3 py-1 rounded-full mb-2 border border-btn/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-btn animate-pulse"></span>
                            Trending
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Popular Dishes</h2>
                        <p className="text-gray-400 text-sm mt-1">Most ordered meals right now</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scrollSlider(foodSliderRef, 'left')}
                            className="p-3 rounded-2xl bg-card/80 border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-card transition-all cursor-pointer shadow-lg active:scale-95"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scrollSlider(foodSliderRef, 'right')}
                            className="p-3 rounded-2xl bg-card/80 border border-gray-800 text-gray-300 hover:text-white hover:border-btn/50 hover:bg-card transition-all cursor-pointer shadow-lg active:scale-95"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-btn"></div>
                    </div>
                ) : foods.length === 0 ? (
                    <div className="text-gray-500 py-10 text-center font-medium">No popular dishes available.</div>
                ) : (
                    <div
                        ref={foodSliderRef}
                        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-6 pt-2 px-1 relative z-10"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {foods.map((foodItem) => (
                            <div
                                key={foodItem._id || foodItem.id}
                                className="min-w-[270px] sm:min-w-[290px] max-w-[290px] bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-xl border border-gray-800/90 rounded-3xl overflow-hidden flex flex-col justify-between shrink-0 shadow-xl group hover:border-btn/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1.5"
                            >
                                <div className="h-48 w-full overflow-hidden bg-primary relative">
                                    <img
                                        src={foodItem.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'}
                                        alt={foodItem.name}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                </div>
                                <div className="p-5 flex flex-col gap-2.5 flex-1 justify-between">
                                    <div>
                                        <h3 className="font-bold text-white text-base truncate group-hover:text-btn transition-colors">{foodItem.name}</h3>
                                        <p className="text-gray-400 text-xs line-clamp-2 mt-1 font-medium">{foodItem.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-800/80">
                                        <span className="font-extrabold text-btn text-base tracking-tight">Rs. {foodItem.price}</span>
                                        <Link
                                            to={`/restaurant/${foodItem.restaurant?._id || foodItem.restaurant}`}
                                            className="bg-btn/15 text-btn border border-btn/30 text-xs font-bold px-4 py-2 rounded-xl hover:bg-btn hover:text-white hover:shadow-lg hover:shadow-btn/25 transition-all duration-300 active:scale-95"
                                        >
                                            Order Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}