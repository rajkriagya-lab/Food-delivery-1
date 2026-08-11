import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../Api/axios';

export default function Navbar() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart item count for the badge safely
    useEffect(() => {
        let isMounted = true;
        if (user) {
            const fetchCartCount = async () => {
                try {
                    const res = await axiosInstance.get('/cart');
                    const items = res.data.cart?.items || res.data.items || [];
                    const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);
                    if (isMounted) setCartCount(totalQty);
                } catch (err) {
                    if (isMounted) setCartCount(0);
                }
            };
            fetchCartCount();
        } else {
            setCartCount(0);
        }
        return () => {
            isMounted = false;
        };
    }, [user, location.pathname]);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Restaurant', path: '/restaurant' },
        { name: 'Cuisines', path: '/cuisines' },
        { name: 'Offers', path: '/offers' },
        { name: 'Track Order', path: '/track' },
    ];

    return (
        <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                
                {/* Brand Logo with Icon */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform">
                        <UtensilsCrossed size={18} />
                    </div>
                    <span className="text-xl font-extrabold tracking-wider text-white">
                        KHAANA<span className="text-orange-500">.</span>
                    </span>
                </Link>

                {/* Desktop Navigation Links - Clean Pill Design */}
                <div className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 px-2 py-1 rounded-full shadow-sm">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-orange-500 text-white font-semibold shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Action Elements / Auth State */}
                <div className="flex items-center gap-3">
                    {!user ? (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link
                                to="/login"
                                className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-900 transition-all"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
                            >
                                Register
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Cart Icon with Badge */}
                            <Link
                                to="/cart"
                                className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all group"
                                aria-label="Cart"
                            >
                                <ShoppingCart size={18} className="group-hover:scale-105 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Profile Link */}
                            <Link
                                to="/orders"
                                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all group hidden sm:flex items-center"
                                aria-label="My orders"
                            >
                                <User size={18} className="group-hover:scale-105 transition-transform" />
                            </Link>

                            {/* Desktop Logout Button */}
                            <button
                                onClick={() => logout(navigate)}
                                className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs font-semibold px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Logout"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none transition-colors"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-950 border-t border-slate-800/80 px-4 py-5 flex flex-col gap-2 shadow-xl">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 mb-1">Menu</div>
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={closeMobileMenu}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                                    isActive
                                        ? 'bg-orange-500 text-white font-semibold'
                                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                }`}
                            >
                                <span>{link.name}</span>
                                <ChevronRight size={14} className="opacity-50" />
                            </Link>
                        );
                    })}

                    {user && (
                        <Link
                            to="/profile"
                            onClick={closeMobileMenu}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
                        >
                            <span className="flex items-center gap-2">
                                <User size={16} /> My Orders
                            </span>
                            <ChevronRight size={14} className="opacity-50" />
                        </Link>
                    )}

                    <div className="border-t border-slate-800/80 pt-3 mt-2 flex flex-col gap-2">
                        {!user ? (
                            <>
                                <Link
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className="w-full bg-slate-900 border border-slate-800 text-center px-4 py-2.5 rounded-xl text-white font-semibold text-xs hover:bg-slate-800 transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={closeMobileMenu}
                                    className="w-full bg-orange-500 text-center px-4 py-2.5 rounded-xl text-white font-semibold text-xs hover:bg-orange-600 transition-all"
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    closeMobileMenu();
                                    logout(navigate);
                                }}
                                className="w-full text-red-400 bg-red-500/10 border border-red-500/20 text-center px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
