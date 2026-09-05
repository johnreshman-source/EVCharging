import React, { createContext, useContext, useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Loading from './components/Loading.jsx'
import { authService } from './services/authService.js'
import './App.css'

// Lazy-load pages for better performance
const Home               = lazy(() => import('./pages/Home.jsx'))
const Login              = lazy(() => import('./pages/Login.jsx'))
const Register           = lazy(() => import('./pages/Register.jsx'))
const Dashboard          = lazy(() => import('./pages/Dashboard.jsx'))
const Stations           = lazy(() => import('./pages/Stations.jsx'))
const StationDetails     = lazy(() => import('./pages/StationDetails.jsx'))
const Reservation        = lazy(() => import('./pages/Reservation.jsx'))
const BookingConfirmation= lazy(() => import('./pages/BookingConfirmation.jsx'))
const BookingHistory     = lazy(() => import('./pages/BookingHistory.jsx'))
const Profile            = lazy(() => import('./pages/Profile.jsx'))
const Admin              = lazy(() => import('./pages/Admin.jsx'))

// ---------------------------------------------------------------------------
// Auth Context
// ---------------------------------------------------------------------------

export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// Route Guards
// ---------------------------------------------------------------------------

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading message="Authenticating…" />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading message="Authenticating…" />
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/dashboard" replace />
  return children
}

// If already logged in, redirect away from auth pages
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('vr_token')
    if (!token) {
      setLoading(false)
      return
    }
    authService.getMe()
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('vr_token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('vr_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('vr_token')
    setUser(null)
  }

  const updateUser = (updatedUser) => setUser(updatedUser)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      <BrowserRouter>
        <Navbar />
        <div className="main-content">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public */}
              <Route path="/"          element={<Home />} />
              <Route path="/stations"  element={<Stations />} />
              <Route path="/stations/:id" element={<StationDetails />} />

              {/* Guest-only */}
              <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

              {/* Protected */}
              <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/reservation" element={<ProtectedRoute><Reservation /></ProtectedRoute>} />
              <Route path="/booking-confirmation/:bookingId"
                element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
              <Route path="/bookings"  element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
              <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
