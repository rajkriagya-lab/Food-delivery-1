import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Clock, Filter, ChevronDown, Utensils } from 'lucide-react';
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
                axiosInstance.get(`/restaurant/all?${queryParams.toString()}`)
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

    return (
        <div className="min-h-screen bg-primary text-white selection:bg-btn selection:text-white pb-20">
            {/* Header / Search Banner */}
            <div className="bg-card border-b border-gray-800 py-10 px-5 sticky top-0 z-30 backdrop-blur-xl bg-opacity-90">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                            <Utensils className="text-btn" size={28} /> Find Restaurants
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm mt-1">Discover places delivering around you</p>
                    </div>

                    {/* Search Form */}
                    <form 
                        onSubmit={handleSearchSubmit}
                        className="w-full md:w-auto flex items-center bg-primary border border-gray-700/80 rounded-2xl p-1.5 shadow-lg focus-within:border-btn focus-within:ring-2 focus-within:ring-btn/20 transition-all"
                    >
                        <Search className="text-gray-400 ml-3 shrink-0" size={18} />
                        <input
                            type="text"
                            placeholder="Search restaurant or dish..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="bg-transparent px-3 py-2 text-white placeholder-gray-500 focus:outline-none text-sm w-full md:w-72"
                        />
                        <button
                            type="submit"
                            className="bg-btn text-white px-5 py-2 rounded-xl font-semibold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-btn/20"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 mt-8">
                {/* Category Filter Pills */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Filter by Category</h3>
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                        <button
                            onClick={() => handleCategoryClick("")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                                !selectedCategory 
                                    ? 'bg-btn text-white border-btn shadow-lg shadow-btn/20' 
                                    : 'bg-card text-gray-300 border-gray-800 hover:border-gray-700'
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
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2 ${
                                        isSelected 
                                            ? 'bg-btn text-white border-btn shadow-lg shadow-btn/20' 
                                            : 'bg-card text-gray-300 border-gray-800 hover:border-gray-700'
                                    }`}
                                >
                                    {cat.image && <img src={cat.image} alt="" className="w-4 h-4 rounded-full object-cover" />}
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Subheader Sorting & Count */}
                <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-800/80">
                    <p className="text-gray-400 text-xs md:text-sm font-medium">
                        Showing <span className="text-white font-bold">{restaurants.length}</span> restaurants
                    </p>

                    <div className="flex items-center gap-2 bg-card border border-gray-800 px-3 py-1.5 rounded-xl">
                        <Filter size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400 hidden sm:inline">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="bg-card/50 border border-gray-800 rounded-2xl h-72 animate-pulse flex flex-col">
                                <div className="h-44 bg-gray-800/60 rounded-t-2xl"></div>
                                <div className="p-4 flex flex-col gap-2 flex-1">
                                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : restaurants.length === 0 ? (
                    <div className="bg-card border border-gray-800 rounded-2xl py-20 text-center flex flex-col items-center justify-center gap-4 mt-6">
                        <div className="w-16 h-16 bg-btn/10 rounded-full flex items-center justify-center text-btn">
                            <Utensils size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white">No restaurants found</h3>
                        <p className="text-gray-400 text-xs max-w-sm">
                            Try adjusting your search filters or browse other categories to find available meals.
                        </p>
                        <button 
                            onClick={() => { setSearchParams({}); setKeyword(""); setSelectedCategory(""); }}
                            className="mt-2 bg-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:opacity-95 transition-all shadow-lg shadow-btn/20 cursor-pointer"
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
                                className="bg-card/80 border border-gray-800/80 rounded-2xl overflow-hidden hover:border-btn/60 transition-all group flex flex-col shadow-xl"
                            >
                                <div className="h-48 w-full overflow-hidden bg-gray-900 relative">
                                    <img 
                                        src={res.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"} 
                                        alt={res.name} 
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {res.rating && (
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-green-400 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/10 shadow-lg">
                                            <Star size={12} fill="currentColor" /> {res.rating}
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10 shadow-md">
                                        <Clock size={11} className="text-btn" /> {res.deliveryTime || "30-40 min"}
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col gap-1.5 flex-1 justify-between">
                                    <div>
                                        <h3 className="font-bold text-base text-white group-hover:text-btn transition-colors truncate">{res.name}</h3>
                                        <p className="text-gray-400 text-xs truncate font-medium mt-0.5">
                                            {res.cuisines?.join(", ") || "Multi-cuisine, Fast Food"}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-800/60 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                                            <MapPin size={12} className="text-gray-400 shrink-0" /> {res.address || "Kathmandu"}
                                        </span>
                                        <span className="text-btn font-semibold">View Menu</span>
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