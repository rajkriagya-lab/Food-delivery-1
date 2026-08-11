import React, { useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Utensils, Flame, Sparkles } from 'lucide-react';
import { Toaster } from 'react-hot-toast'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import { useAuthStore } from './store/authStore'
import AdminDashboard from './pages/admin/AdminDashboard'
import RestaurantDashboard from './pages/restaurants/RestaurantDashboard'

import Layout from './components/layouts/Layout'
import Restaurants from './pages/customer/Restaurants'
import RestaurantDetails from './pages/customer/RestaurantDetails'
import Home from './pages/customer/Home'
import Cuisines from './pages/customer/Cuisines'
import Offers from './pages/customer/Offers'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import AddAddress from './pages/customer/AddAddress'
import Orders from './pages/customer/Orders'
import PaymentResult from './pages/customer/PaymentResult'

export default function App() {
  const { checkAuth, checkingAuth, user } = useAuthStore();
  const dashboardPath = user?.role === "ADMIN"
    ? "/admin/dashboard"
    : user?.role === "RESTURANT_OWNER"
      ? "/restaurant/dashboard"
      : "/";

  useEffect(() => {
    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white relative overflow-hidden selection:bg-btn selection:text-white">
        {/* Background Ambient Glow */}
        <div className="absolute w-72 h-72 bg-btn/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-4">
          {/* Floating Icon Container */}
          <div className="w-20 h-20 rounded-3xl bg-card border border-gray-800 shadow-2xl flex items-center justify-center relative mb-6 group">
            <div className="absolute inset-0 rounded-3xl bg-btn/20 animate-ping opacity-75"></div>
            <Utensils size={32} className="text-btn animate-bounce relative z-10" />
            <Flame size={18} className="text-amber-400 absolute -top-1 -right-1 animate-pulse z-20" />
          </div>

          {/* App Brand Name with Modern Effect */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl font-black tracking-tight text-white">Khanna</span>
            <Sparkles size={20} className="text-btn animate-spin" />
          </div>

          <p className="text-sm font-medium text-gray-400 tracking-wide animate-pulse">
            Preparing something delicious for you...
          </p>

          {/* Modern Loading Progress Dots */}
          <div className="flex items-center gap-1.5 mt-6">
            <div className="w-2 h-2 rounded-full bg-btn animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-btn animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-btn animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-primary text-white'>
      <Toaster position='top-right' />
      <Routes>
        {/* Layout Route wrapping customer pages so Navbar & Footer render correctly */}
        <Route element={<Layout />}>
          <Route path="/" element={user?.role === "ADMIN" || user?.role === "RESTURANT_OWNER" ? <Navigate to={dashboardPath} replace /> : <Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/cuisines" element={<Cuisines />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/track" element={user?.role === "CUSTOMER" ? <Orders /> : <Navigate to="/login" replace />} />
          <Route path="/orders" element={user?.role === "CUSTOMER" ? <Orders /> : <Navigate to="/login" replace />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route
            path="/cart"
            element={
              user ? (
                user.role === "CUSTOMER" ? (
                  <Cart />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/checkout"
            element={
              user ? (
                user.role === "CUSTOMER" ? (
                  <Checkout />
                ) : (
                  <Navigate to="/login" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/address/add"
            element={
              user?.role === "CUSTOMER" ? <AddAddress /> : <Navigate to="/login" replace />
            }
          />
        </Route>

        {/* Auth Routes */}
        <Route
          path='/register'
          element={
            user ? (
              <Navigate to={
                user.role === "ADMIN"
                  ? "/admin/dashboard"
                  : user.role === "RESTURANT_OWNER"
                    ? "/restaurant/dashboard"
                    : "/"
              } replace />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path='/login'
          element={
            user ? (
              <Navigate to={
                user.role === "ADMIN"
                  ? "/admin/dashboard"
                  : user.role === "RESTURANT_OWNER"
                    ? "/restaurant/dashboard"
                    : "/"
              } replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Dashboard Routes (No Navbar/Footer) */}
        <Route
          path="/restaurant/dashboard"
          element={
            user ? (
              user.role === "RESTURANT_OWNER" ? (
                <RestaurantDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            user ? (
              user.role === "ADMIN" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </div>
  )
}
