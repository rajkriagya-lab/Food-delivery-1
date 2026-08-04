import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, Search, ArrowRight, ChevronRight } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function Cuisines() {
    const navigate = useNavigate();
    const [cuisines, setCuisines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCuisines = async () => {
            try {
                // If you have a dedicated cuisines endpoint, use it here. 
                // Alternatively, we fetch categories or extract unique cuisines.
                const res = await axiosInstance.get('/categories/all');
                setCuisines(res.data.categories || res.data.cuisines || []);
            } catch (error) {
                console.log('Error fetching cuisines:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCuisines();
    }, []);

    const filteredCuisines = cuisines.filter((item) => {
        const name = typeof item === 'string' ? item : item.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSelectCuisine = (cuisineName) => {
        navigate(`/restaurant?category=${encodeURIComponent(cuisineName)}`);
    };

    return (
        <div className="min-h-screen bg-primary text-white selection:bg-btn selection:text-white pb-20">
            {/* Header / Banner */}
            <div className="bg-card border-b border-gray-800 py-12 px-5">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-4">
                    <span className="inline-flex items-center gap-2 bg-btn/10 text-btn text-xs font-medium px-4 py-1.5 rounded-full border border-btn/20">
                        <Utensils size={14} /> Explore Flavors
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                        Discover All <span className="text-btn">Cuisines</span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base max-w-xl">
                        Craving something specific? Browse through our extensive selection of authentic local and international food genres.
                    </p>

                    {/* Search filter for cuisines */}
                    <div className="w-full max-w-md flex items-center bg-primary border border-gray-700/80 rounded-2xl p-1.5 shadow-lg mt-2 focus-within:border-btn focus-within:ring-2 focus-within:ring-btn/20 transition-all">
                        <Search className="text-gray-400 ml-3 shrink-0" size={18} />
                        <input
                            type="text"
                            placeholder="Search cuisines (e.g. Italian, MoMo)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent px-3 py-2 text-white placeholder-gray-500 focus:outline-none text-sm w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-5 mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-white">Available Cuisines & Categories</h2>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium">
                        Showing <span className="text-white font-bold">{filteredCuisines.length}</span> options
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 py-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                            <div key={n} className="bg-card/50 border border-gray-800 rounded-2xl h-44 animate-pulse flex flex-col items-center justify-center gap-3">
                                <div className="w-20 h-20 bg-gray-800/80 rounded-full"></div>
                                <div className="h-3 bg-gray-800 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredCuisines.length === 0 ? (
                    <div className="bg-card border border-gray-800 rounded-2xl py-20 text-center flex flex-col items-center justify-center gap-3 mt-4">
                        <Utensils size={32} className="text-gray-500" />
                        <h3 className="text-base font-bold text-white">No cuisines found</h3>
                        <p className="text-gray-400 text-xs">We couldn't find any matching categories or cuisines.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                        {filteredCuisines.map((item, idx) => {
                            const name = typeof item === 'string' ? item : item.name;
                            const image = typeof item === 'string' 
                                ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" 
                                : (item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c");

                            return (
                                <div
                                    key={item._id || item.id || idx}
                                    onClick={() => handleSelectCuisine(name)}
                                    className="bg-card/80 border border-gray-800/80 p-5 rounded-2xl text-center hover:border-btn/60 hover:bg-card transition-all group cursor-pointer flex flex-col items-center gap-3 shadow-lg"
                                >
                                    <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-900 border border-gray-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                                        <img 
                                            src={image} 
                                            alt={name} 
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <h3 className="font-bold text-xs sm:text-sm text-gray-200 group-hover:text-btn transition-colors truncate w-full">
                                            {name}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-center gap-0.5 group-hover:text-gray-300">
                                            Explore <ChevronRight size={12} />
                                        </span>
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