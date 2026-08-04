import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Layout() {
    const { user } = useAuthStore()
    
    // Show layout if there's no user logged in OR if the logged-in user is a CUSTOMER.
    // This hides the Navbar and Footer for non-customer roles (e.g., ADMIN, RESTAURANT_OWNER).
    const showLayout = !user || user.role === "CUSTOMER"

    return (
        <>
            {showLayout && <Navbar />}

            <main className="min-h-screen">
                <Outlet />
            </main>

            {showLayout && <Footer />}
        </>
    )
}