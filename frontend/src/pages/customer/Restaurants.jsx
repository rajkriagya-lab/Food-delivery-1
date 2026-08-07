import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Clock, Filter, ChevronDown, Utensils, Sparkles, Flame, X, RotateCcw } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function RestaurantList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states initialized from URL parameters
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");

    // Fetch categories and restaurants based on active filters
    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (keyword) queryParams.set("keyword", keyword);
            if (selectedCategory) queryParams.set("category", selectedCategory);
            if (sortBy) queryParams.set("sort", sortBy);

            const [categoryRes, restaurantRes] = await Promise.all([
                axiosInstance.get("/categories/all"),
                axiosInstance.get(`/restaurants/all?${queryParams.toString()}`)
            ]);

            setCategories(categoryRes.data.categories || []);
            setRestaurants(restaurantRes.data.restaurants || restaurantRes.data.restaurant || []);
        } catch (error) {
            console.log("Error fetching restaurant list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, [searchParams]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (keyword) {
            params.set("keyword", keyword);
        } else {
            params.delete("keyword");
        }
        setSearchParams(params);
    };

    const handleCategoryClick = (catName) => {
        const params = new URLSearchParams(searchParams);
        if (selectedCategory === catName) {
            setSelectedCategory("");
            params.delete("category");
        } else {
            setSelectedCategory(catName);
            params.set("category", catName);
        }
        setSearchParams(params);
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortBy(value);
        const params = new URLSearchParams(searchParams);
        params.set("sort", value);
        setSearchParams(params);
    };

    const clearFilter = (type) => {
        const params = new URLSearchParams(searchParams);
        if (type === 'keyword') {
            setKeyword("");
            params.delete("keyword");
        } else if (type === 'category') {
            setSelectedCategory("");
            params.delete("category");
        }
        setSearchParams(params);
    };

    const hasActiveFilters = keyword || selectedCategory;

    return (
        <div className="min-h-screen bg-primary text-white selection:bg-btn selection:text-white pb-24">
            {/* Immersive Header & Search Banner */}
            <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-primary border-b border-gray-800/80 py-10 px-5 sticky top-0 z-30 backdrop-blur-2xl shadow-2xl">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff4757_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1 text-center md:text-left">
                        <span className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-bold px-3 py-1 rounded-full border border-btn/20 shadow-sm mb-1">
                            <Flame size={13} /> Top Rated Dining Spots
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2 text-white">
                            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-btn via-rose-500 to-amber-500">Restaurants</span>
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm font-medium">Discover top-tier kitchens and culinary spots delivering near you</p>
                    </div>

                    {/* Attractive Search Form */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="w-full md:w-auto flex items-center bg-primary/90 border border-gray-700/80 rounded-2xl p-1.5 shadow-xl focus-within:border-btn focus-within:ring-4 focus-within:ring-btn/15 transition-all"
                    >
                        <Search className="text-gray-400 ml-3 shrink-0" size={18} />
                        <input
                            type="text"
                            placeholder="Search restaurant or dish..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="bg-transparent px-3 py-2 text-white placeholder-gray-500 focus:outline-none text-sm w-full md:w-80 font-medium"
                        />
                        {keyword && (
                            <button 
                                type="button" 
                                onClick={() => clearFilter('keyword')}
                                className="text-gray-400 hover:text-white px-2"
                            >
                                <X size={16} />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="bg-btn text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-lg shadow-btn/30 shrink-0"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 mt-8">
                {/* Category Filter Pills */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-btn" /> Categories
                        </h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                        <button
                            onClick={() => handleCategoryClick("")}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2 ${!selectedCategory
                                ? 'bg-btn text-white border-btn shadow-lg shadow-btn/25 scale-105'
                                : 'bg-card/80 text-gray-300 border-gray-800 hover:border-gray-700 hover:bg-card'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => {
                            const isSelected = selectedCategory === cat.name;
                            return (
                                <button
                                    key={cat._id || cat.id}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2.5 ${isSelected
                                        ? 'bg-btn text-white border-btn shadow-lg shadow-btn/25 scale-105'
                                        : 'bg-card/80 text-gray-300 border-gray-800 hover:border-gray-700 hover:bg-card'
                                    }`}
                                >
                                    {cat.image && <img src={cat.image} alt="" className="w-5 h-5 rounded-full object-cover border border-white/20" />}
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Active Filter Tags Bar (If filters applied) */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 bg-card/40 border border-gray-800 p-3 rounded-2xl">
                        <span className="text-xs text-gray-400 font-semibold mr-1">Active Filters:</span>
                        {keyword && (
                            <span className="inline-flex items-center gap-1.5 bg-btn/10 text-btn border border-btn/30 text-xs font-bold px-3 py-1 rounded-xl">
                                Keyword: "{keyword}"
                                <button onClick={() => clearFilter('keyword')} className="hover:opacity-75"><X size={13} /></button>
                            </span>
                        )}
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1.5 bg-btn/10 text-btn border border-btn/30 text-xs font-bold px-3 py-1 rounded-xl">
                                Category: {selectedCategory}
                                <button onClick={() => clearFilter('category')} className="hover:opacity-75"><X size={13} /></button>
                            </span>
                        )}
                        <button
                            onClick={() => { setSearchParams({}); setKeyword(""); setSelectedCategory(""); }}
                            className="ml-auto text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <RotateCcw size={13} /> Clear All
                        </button>
                    </div>
                )}

                {/* Subheader Sorting & Count */}
                <div className="flex justify-between items-center mb-8 pt-4 border-t border-gray-800/80">
                    <p className="text-gray-300 text-xs md:text-sm font-semibold">
                        Showing <span className="text-btn font-extrabold">{restaurants.length}</span> active restaurants
                    </p>

                    <div className="flex items-center gap-2.5 bg-card/90 border border-gray-800 px-4 py-2 rounded-2xl shadow-inner">
                        <Filter size={15} className="text-btn" />
                        <span className="text-xs text-gray-400 font-medium hidden sm:inline">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="rating" className="bg-card text-white">Highest Rated</option>
                            <option value="deliveryTime" className="bg-card text-white">Fastest Delivery</option>
                            <option value="costLowToHigh" className="bg-card text-white">Cost: Low to High</option>
                            <option value="costHighToLow" className="bg-card text-white">Cost: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Restaurant Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="bg-card/40 border border-gray-800/80 rounded-3xl h-80 animate-pulse flex flex-col p-3 gap-3">
                                <div className="h-48 bg-gray-800/80 rounded-2xl"></div>
                                <div className="flex flex-col gap-2 p-1">
                                    <div className="h-4 bg-gray-800 rounded-xl w-3/4"></div>
                                    <div className="h-3 bg-gray-800 rounded-xl w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : restaurants.length === 0 ? (
                    <div className="bg-card/60 backdrop-blur-xl border border-gray-800 rounded-3xl py-24 text-center flex flex-col items-center justify-center gap-4 mt-6 shadow-2xl">
                        <div className="w-16 h-16 bg-btn/10 rounded-full flex items-center justify-center text-btn shadow-lg shadow-btn/20">
                            <Utensils size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white">No restaurants found</h3>
                        <p className="text-gray-400 text-xs max-w-sm">
                            We couldn't find anything matching your search criteria. Try resetting filters or searching for another dish.
                        </p>
                        <button
                            onClick={() => { setSearchParams({}); setKeyword(""); setSelectedCategory(""); }}
                            className="mt-2 bg-btn text-white text-xs font-bold px-6 py-3 rounded-2xl hover:opacity-95 transition-all shadow-lg shadow-btn/30 cursor-pointer active:scale-95"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {restaurants.map((res) => (
                            <Link
                                key={res._id || res.id}
                                to={`/restaurant/${res._id || res.id}`}
                                className="bg-gradient-to-b from-card/90 to-card/50 border border-gray-800/80 rounded-3xl overflow-hidden hover:border-btn/80 hover:shadow-2xl hover:shadow-btn/15 transition-all duration-300 group flex flex-col"
                            >
                                <div className="h-52 w-full overflow-hidden bg-gray-900 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10"></div>
                                    <img
                                        src={res.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"}
                                        alt={res.name}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Rating Badge */}
                                    {res.rating && (
                                        <div className="absolute top-3.5 right-3.5 bg-black/75 backdrop-blur-md text-amber-400 text-xs font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 border border-white/15 shadow-xl z-20">
                                            <Star size={13} fill="currentColor" /> {res.rating}
                                        </div>
                                    )}

                                    {/* Delivery Time Badge */}
                                    <div className="absolute bottom-3.5 left-3.5 bg-black/75 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/15 shadow-xl z-25">
                                        <Clock size={13} className="text-btn" /> {res.deliveryTime || "30-40 min"}
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-extrabold text-base text-white group-hover:text-btn transition-colors truncate">{res.name}</h3>
                                        <p className="text-gray-400 text-xs truncate font-medium">
                                            {res.cuisines?.join(", ") || "Multi-cuisine, Fast Food"}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-800/80 text-xs font-semibold">
                                        <span className="flex items-center gap-1.5 truncate max-w-[170px] text-gray-400">
                                            <MapPin size={13} className="text-btn shrink-0" /> {res.address || "Kathmandu"}
                                        </span>
                                        <span className="text-btn font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                            Menu &rarr;
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}