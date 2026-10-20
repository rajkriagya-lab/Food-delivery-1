import { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { Utensils, Flame, Sparkles } from 'lucide-react'
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
import Profile from './pages/customer/Profile'
import About from './pages/info/About'
import Careers from './pages/info/Careers'
import FAQ from './pages/info/FAQ'
import Partner from './pages/info/Partner'
import PartnerSignup from './pages/info/PartnerSignup'

function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, search, hash])

  return null
}

// Helper function to resolve user dashboard based on role
const getDashboardPath = (role) => {
  if (role === 'ADMIN') return '/admin/dashboard'
  if (role === 'RESTURANT_OWNER') return '/restaurant/dashboard'
  return '/'
}

// Protected Route Component
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }
  return children
}

// Public-Only Route Component (Prevents logged in users from visiting Login/Register)
const PublicOnlyRoute = ({ user, children }) => {
  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }
  return children
}

export default function App() {
  const { checkAuth, checkingAuth, user } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

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

          {/* App Brand Name */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl font-black tracking-tight text-white">Khanna</span>
            <Sparkles size={20} className="text-btn animate-spin" />
          </div>

          <p className="text-sm font-medium text-gray-400 tracking-wide animate-pulse">
            Preparing something delicious for you...
          </p>

          {/* Loading Progress Dots */}
          <div className="flex items-center gap-1.5 mt-6">
            <div className="w-2 h-2 rounded-full bg-btn animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-btn animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-btn animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary text-white">
      <Toaster position="top-right" />
      <ScrollToTop />
      <Routes>
        {/* Customer Pages wrapped in Layout (Navbar & Footer) */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              user && user.role !== 'CUSTOMER' ? (
                <Navigate to={getDashboardPath(user.role)} replace />
              ) : (
                <Home />
              )
            }
          />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/cuisines" element={<Cuisines />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/partner/signup" element={<PartnerSignup />} />
          <Route path="/payment/result" element={<PaymentResult />} />

          {/* Protected Customer Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track"
            element={
              <ProtectedRoute user={user} allowedRoles={['CUSTOMER']}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute user={user} allowedRoles={['CUSTOMER']}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute user={user} allowedRoles={['CUSTOMER']}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute user={user} allowedRoles={['CUSTOMER']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/address/add"
            element={
              <ProtectedRoute user={user} allowedRoles={['CUSTOMER']}>
                <AddAddress />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Authentication Routes */}
        <Route
          path="/register"
          element={
            <PublicOnlyRoute user={user}>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute user={user}>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Dashboard Routes (No Layout) */}
        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute user={user} allowedRoles={['RESTURANT_OWNER']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute user={user} allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch-all Wildcard Route */}
        <Route path="*" element={<Navigate to={getDashboardPath(user?.role)} replace />} />
      </Routes>
    </div>
  )
}
