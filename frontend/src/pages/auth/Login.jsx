import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Utensils, Flame } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/auth/Button';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault(); 
        login(formData, navigate);
    };

    return (
        <AuthLayout title="Welcome Back! 🍕" subtitle="Sign in to track your delicious food delivery">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-300 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            required
                            placeholder="Enter your email"
                            className="w-full bg-primary border border-gray-700/80 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-btn transition-colors"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="block text-xs font-semibold text-gray-300">Password</label>
                        <Link to="/forgot-password" className="text-xs text-btn hover:underline font-medium">
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-primary border border-gray-700/80 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-btn transition-colors"
                        />
                    </div>
                </div>

                {/* Unique Food-Themed Loading Effect Button */}
                <div className="pt-2">
                    <Button 
                        disabled={loading}
                        className="w-full bg-btn text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-btn/30 hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-80 relative overflow-hidden group"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3 py-0.5">
                                <div className="relative flex items-center justify-center">
                                    <Utensils size={18} className="text-white animate-bounce" />
                                    <Flame size={14} className="text-amber-400 absolute -top-2 -right-2 animate-ping" />
                                </div>
                                <span className="tracking-wide animate-pulse font-extrabold">Cooking up your session...</span>
                            </div>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Utensils size={16} className="text-white/80" />
                                <span>Log In & Order</span>
                            </span>
                        )}
                    </Button>
                </div>
            </form>

            {/* Footer Sign up link */}
            <div className="text-center mt-6 pt-4 border-t border-gray-800/80">
                <p className="text-xs text-gray-400">
                    New to the platform?{' '}
                    <Link to="/register" className="text-btn font-bold hover:underline ml-1">
                        Create an account ✨
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}