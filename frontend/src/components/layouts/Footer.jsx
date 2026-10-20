import { Link } from 'react-router-dom'
import { ArrowUpRight, UtensilsCrossed } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="mt-16 border-t border-white/8 bg-slate-950/80">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
                <div className="max-w-sm">
                    <Link to="/" className="inline-flex items-center gap-3 rounded-xl text-white">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-400/10 text-orange-300"><UtensilsCrossed size={19} /></span>
                        <span className="text-lg font-black tracking-[0.16em]">KHAANA<span className="text-orange-300">.</span></span>
                    </Link>
                    <p className="mt-4 text-sm leading-6 text-slate-400">Discover local kitchens, find your next favorite, and order in a few simple steps.</p>
                </div>

                <nav aria-label="Explore KHAANA">
                    <h2 className="text-sm font-bold text-white">Explore</h2>
                    <ul className="mt-4 space-y-3 text-sm text-slate-400">
                        <li><Link to="/restaurant" className="transition hover:text-orange-200">Restaurants</Link></li>
                        <li><Link to="/cuisines" className="transition hover:text-orange-200">Cuisines</Link></li>
                        <li><Link to="/offers" className="transition hover:text-orange-200">Offers</Link></li>
                    </ul>
                </nav>

                <nav aria-label="Company and support">
                    <h2 className="text-sm font-bold text-white">Company & support</h2>
                    <ul className="mt-4 space-y-3 text-sm text-slate-400">
                        <li><Link to="/about" className="transition hover:text-orange-200">About us</Link></li>
                        <li><Link to="/careers" className="transition hover:text-orange-200">Careers</Link></li>
                        <li><Link to="/partner" className="inline-flex items-center gap-1 transition hover:text-orange-200">Partner with us <ArrowUpRight size={14} /></Link></li>
                        <li><Link to="/faq" className="transition hover:text-orange-200">Help & FAQs</Link></li>
                        <li><Link to="/orders" className="inline-flex items-center gap-1 transition hover:text-orange-200">Your orders <ArrowUpRight size={14} /></Link></li>
                    </ul>
                </nav>
            </div>

            <div className="border-t border-white/8">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <p>© {new Date().getFullYear()} KHAANA. All rights reserved.</p>
                    <p>Made for good food and good company.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
