import React, { useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import { useAuthStore } from './store/authStore'
import AdminDashboard from './pages/admin/AdminDashboard'
import RestaurantDashboard from './pages/restaurants/RestaurantDashboard'

import Layout from './components/layouts/Layout'
import Restaurants from './pages/customer/Restaurants'
import Home from './pages/customer/Home'
import Cuisines from './pages/customer/Cuisines'
import Offers from './pages/customer/Offers'
import TrackOrder from './pages/customer/TrackOrder'
import Cart from './pages/customer/Cart'

export default function App() {
  const { checkAuth, loading, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-primary text-white'>
      <Toaster position='top-right' />
      <Routes>
        {/* Layout Route wrapping customer pages so Navbar & Footer render correctly */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant" element={<Restaurants />} />
          <Route path="/cuisines" element={<Cuisines />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/track" element={<TrackOrder />} />
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
      </Routes>
    </div>
  )
}