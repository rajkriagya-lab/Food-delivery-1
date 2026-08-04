import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-card border-t border-gray-800 mt-16">
            {/* Top Section */}
            <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                <div>
                    <h2 className="text-2xl font-bold mb-3 text-white tracking-wider">KHAANA.</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Connecting Kathmandu's kitchens to your doorstep, one hot plate at a time.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 text-white text-base">Company</h3>
                    <ul className="space-y-2.5 text-gray-400 text-sm">
                        <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                        <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                        <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 text-white text-base">For Restaurant</h3>
                    <ul className="space-y-2.5 text-gray-400 text-sm">
                        <li><Link to="/partner" className="hover:text-white transition-colors">Partner with us</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 text-white text-base">Support</h3>
                    <ul className="space-y-2.5 text-gray-400 text-sm">
                        <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                        <li><Link to="/track" className="hover:text-white transition-colors">Track an order</Link></li>
                        <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-5 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} KHAANA. All Rights Reserved.
                    </p>
                    <p className="text-gray-400 text-sm font-medium">
                        Fast • Fresh • Delicious
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer