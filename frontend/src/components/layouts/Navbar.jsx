import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
    const { logout, user } = useAuthStore()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <nav className="bg-card border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <Link to="/" className="text-2xl font-bold text-white tracking-wider">
                    KHAANA.
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-8 text-gray-300 font-medium">
                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                    <Link to="/restaurant" className="hover:text-white transition-colors">Restaurant</Link>
                    <Link to="/cuisines" className="hover:text-white transition-colors">Cuisines</Link>
                    <Link to="/offers" className="hover:text-white transition-colors">Offer</Link>
                    <Link to="/track" className="hover:text-white transition-colors">Track Order</Link>
                </div>

                {/* Action Elements / Auth State */}
                <div className="flex items-center gap-4">
                    {!user ? (
                        <div className="hidden sm:flex items-center gap-3">
                            <Link to="/login" className="bg-btn px-4 py-2 rounded-lg text-white hover:opacity-95 transition-opacity">Login</Link>
                            <Link to="/register" className="bg-btn px-4 py-2 rounded-lg text-white hover:opacity-95 transition-opacity">Register</Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/cart" className="text-white hover:text-gray-300 transition-colors" aria-label="Cart">
                                <ShoppingCart size={22} />
                            </Link>
                            <Link to="/profile" className="text-white hover:text-gray-300 transition-colors" aria-label="Profile">
                                <User size={22} />
                            </Link>
                            <button
                                onClick={() => logout(navigate)}
                                className="hidden sm:inline-block bg-btn px-4 py-2 rounded-lg cursor-pointer text-white hover:opacity-95 transition-opacity"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden text-gray-300 hover:text-white focus:outline-none"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-card border-t border-gray-800 px-5 pt-4 pb-6 flex flex-col gap-4 text-gray-300">
                    <Link
                        to="/"
                        onClick={closeMobileMenu}
                        className="hover:text-white transition-colors py-1"
                    >
                        Home
                    </Link>
                    <Link
                        to="/restaurant"
                        onClick={closeMobileMenu}
                        className="hover:text-white transition-colors py-1"
                    >
                        Restaurant
                    </Link>
                    <Link
                        to="/cuisines"
                        onClick={closeMobileMenu}
                        className="hover:text-white transition-colors py-1"
                    >
                        Cuisines
                    </Link>
                    <Link
                        to="/offers"
                        onClick={closeMobileMenu}
                        className="hover:text-white transition-colors py-1"
                    >
                        Offer
                    </Link>
                    <Link
                        to="/track"
                        onClick={closeMobileMenu}
                        className="hover:text-white transition-colors py-1"
                    >
                        Track Order
                    </Link>

                    <div className="border-t border-gray-800 pt-4 flex flex-col gap-3">
                        {!user ? (
                            <>
                                <Link
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className="bg-btn text-center px-4 py-2 rounded-lg text-white"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={closeMobileMenu}
                                    className="bg-btn text-center px-4 py-2 rounded-lg text-white"
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    closeMobileMenu()
                                    logout(navigate)
                                }}
                                className="bg-btn w-full text-center px-4 py-2 rounded-lg cursor-pointer text-white"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}