import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../contexts/SoundContext'

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, isAuthenticated, user } = useAuth()
  const { playSound } = useSound()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin'

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, navigate, from])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    playSound('click')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        
        // Update auth context
        const authResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        })
        
        if (authResponse.ok) {
          const authData = await authResponse.json()
          // Manually update the auth context
          window.location.href = '/admin'
        }
      } else {
        setError(data.message || 'Login failed')
        playSound('defeat')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please try again.')
      playSound('defeat')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-beyblade-dark via-beyblade-purple/10 to-beyblade-dark flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-white/80 hover:text-neon-blue transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-beyblade">Back to Home</span>
        </motion.button>

        {/* Login Card */}
        <motion.div
          variants={itemVariants}
          className="card-glow p-8"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <Shield className="w-16 h-16 text-neon-blue mx-auto" />
            </motion.div>
            
            <h1 className="text-3xl font-anime font-bold text-glow mb-2">
              ADMIN LOGIN
            </h1>
            <p className="text-white/80 font-beyblade">
              Access the tournament management system
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-neon-red/20 border border-neon-red/50 text-neon-red text-sm font-beyblade"
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword)
                    playSound('click')
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-neon-blue transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className="w-full btn-primary font-beyblade py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>LOGGING IN...</span>
                </div>
              ) : (
                'LOGIN TO ADMIN PANEL'
              )}
            </motion.button>
          </motion.form>

          {/* Security Notice */}
          <motion.div
            variants={itemVariants}
            className="mt-8 p-4 rounded-lg bg-neon-blue/10 border border-neon-blue/30"
          >
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-neon-blue mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-beyblade font-bold text-neon-blue mb-1">
                  Security Notice
                </h4>
                <p className="text-xs text-white/70 font-beyblade">
                  This is a secure admin area. All login attempts are logged and monitored.
                  Only authorized administrators can access this system.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-8"
        >
          <p className="text-white/50 font-beyblade text-sm">
            Spin 2 Win Tournament Management System
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
