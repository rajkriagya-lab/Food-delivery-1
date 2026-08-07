import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, Search, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import axiosInstance from '../../Api/axios';

export default function Cuisines() {
    const navigate = useNavigate();
    const [cuisines, setCuisines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCuisines = async () => {
            try {
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
        <div className="min-h-screen bg-primary text-white selection:bg-btn selection:text-white pb-24">
            {/* Immersive Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/90 to-primary border-b border-gray-800 py-16 px-5">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff4757_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-5 relative z-10">
                    <span className="inline-flex items-center gap-2 bg-btn/10 text-btn text-xs font-bold px-4 py-2 rounded-full border border-btn/20 shadow-sm animate-pulse">
                        <Sparkles size={14} /> Curated Culinary Experiences
                    </span>
                    
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        Explore Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-btn via-rose-500 to-amber-500">Cuisines</span>
                    </h1>
                    
                    <p className="text-gray-300 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
                        Satisfy your cravings by exploring a diverse variety of signature dishes, authentic flavors, and world-class culinary categories.
                    </p>

                    {/* Attractive Search Bar */}
                    <div className="w-full max-w-lg flex items-center bg-card/90 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-2 shadow-2xl mt-4 focus-within:border-btn focus-within:ring-4 focus-within:ring-btn/15 transition-all">
                        <Search className="text-gray-400 ml-3 shrink-0" size={20} />
                        <input
                            type="text"
                            placeholder="Search your favorite cuisine (e.g. Italian, Burgers, MoMo)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none text-sm w-full font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-5 mt-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Categories & Flavors</h2>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Select a category to view specialized restaurants and dishes</p>
                    </div>
                    <span className="bg-card border border-gray-800 px-4 py-1.5 rounded-full text-xs font-bold text-gray-300 shadow-inner">
                        <span className="text-btn font-extrabold">{filteredCuisines.length}</span> Available
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 py-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                            <div key={n} className="bg-card/40 border border-gray-800/80 rounded-3xl h-52 animate-pulse flex flex-col items-center justify-center gap-4 p-4">
                                <div className="w-24 h-24 bg-gray-800 rounded-full shadow-inner"></div>
                                <div className="h-4 bg-gray-800 rounded-xl w-20"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredCuisines.length === 0 ? (
                    <div className="bg-card/60 backdrop-blur-md border border-gray-800 rounded-3xl py-24 text-center flex flex-col items-center justify-center gap-4 mt-6 shadow-2xl">
                        <div className="h-16 w-16 rounded-full bg-btn/10 flex items-center justify-center text-btn">
                            <Utensils size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white">No matching cuisines found</h3>
                        <p className="text-gray-400 text-xs max-w-sm">We couldn't find any category matching your search term. Try searching for something else.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {filteredCuisines.map((item, idx) => {
                            const name = typeof item === 'string' ? item : item.name;
                            const image = typeof item === 'string' 
                                ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" 
                                : (item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c");

                            return (
                                <div
                                    key={item._id || item.id || idx}
                                    onClick={() => handleSelectCuisine(name)}
                                    className="bg-gradient-to-b from-card/90 to-card/50 border border-gray-800/80 p-5 rounded-3xl text-center hover:border-btn hover:shadow-2xl hover:shadow-btn/10 transition-all duration-300 group cursor-pointer flex flex-col items-center gap-4 relative overflow-hidden"
                                >
                                    {/* Subtle highlight overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-btn/0 to-btn/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                    {/* Attractive Circular Image with Glow */}
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-btn/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="h-28 w-28 rounded-full overflow-hidden bg-primary border-2 border-gray-800 group-hover:border-btn flex items-center justify-center shadow-xl group-hover:scale-105 transition-all duration-500 relative z-10">
                                            <img 
                                                src={image} 
                                                alt={name} 
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Cuisine Text & Action */}
                                    <div className="w-full relative z-10 space-y-1">
                                        <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-btn transition-colors truncate w-full tracking-tight">
                                            {name}
                                        </h3>
                                        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-gray-200 transition-colors pt-1">
                                            <span>Explore</span>
                                            <ChevronRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
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