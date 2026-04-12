import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import TestimoniesPage from './pages/TestimoniesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NewRequestPage from './pages/NewRequestPage'
import MyRequestsPage from './pages/MyRequestsPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/globo" element={<HomePage />} />
          <Route path="/testimonios" element={<TestimoniesPage />} />
          <Route path="/nueva" element={<ProtectedRoute><NewRequestPage /></ProtectedRoute>} />
          <Route path="/mis-peticiones" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
