import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowLeft, Clock } from 'lucide-react';

export default function TrackOrder() {
    return (
        <div className="min-h-screen bg-primary text-white selection:bg-btn selection:text-white flex flex-col">
            {/* Header / Navbar */}
            <div className="bg-card border-b border-gray-800 py-6 px-5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-xs sm:text-sm font-semibold transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                        Track <span className="text-btn">Order</span>
                    </h1>
                </div>
            </div>

            {/* Main Content - Work in Progress Banner */}
            <div className="flex-1 flex items-center justify-center px-5 py-16">
                <div className="max-w-md w-full bg-card/80 border border-gray-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-btn/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center gap-5">
                        <div className="w-20 h-20 bg-btn/10 border border-btn/20 rounded-2xl flex items-center justify-center text-btn shadow-lg shadow-btn/10 animate-pulse">
                            <Wrench size={36} />
                        </div>

                        <div>
                            <span className="inline-flex items-center gap-1.5 bg-btn/10 text-btn text-xs font-semibold px-3 py-1 rounded-full border border-btn/20 mb-3">
                                <Clock size={12} /> Coming Soon
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Work in Progress
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed">
                                We are currently building a fully integrated real-time tracking dashboard for your orders. Stay tuned!
                            </p>
                        </div>

                        <div className="w-full pt-4 border-t border-gray-800/80">
                            <Link 
                                to="/" 
                                className="w-full inline-flex items-center justify-center gap-2 bg-btn text-white py-3 px-6 rounded-xl font-semibold text-sm hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-btn/20"
                            >
                                Return to Homepage
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}