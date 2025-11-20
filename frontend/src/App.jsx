import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ParticleProvider } from './contexts/ParticleContext'
import { SoundProvider } from './contexts/SoundContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import Home from './pages/Home'
import BattleUpdates from './pages/BattleUpdates'
import LiveQuiz from './pages/LiveQuiz'
import ContactUs from './pages/ContactUs'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <SoundProvider>
          <ParticleProvider>
            <div className="min-h-screen bg-beyblade-dark relative overflow-x-hidden">
              <ParticleBackground />
              <Navbar />
              
              <main className="relative z-10">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/battle-updates" element={<BattleUpdates />} />
                  <Route path="/live-quiz" element={<LiveQuiz />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
              
              <Footer />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'linear-gradient(135deg, #1c0066, #6b00ff)',
                    color: '#fff',
                    border: '1px solid #00f6ff',
                    borderRadius: '12px',
                    boxShadow: '0 0 20px rgba(0, 246, 255, 0.3)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#00f6ff',
                      secondary: '#05011a',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ff004d',
                      secondary: '#05011a',
                    },
                  },
                }}
              />
            </div>
          </ParticleProvider>
        </SoundProvider>
      </AuthProvider>
    </Router>
  )
}

export default App




