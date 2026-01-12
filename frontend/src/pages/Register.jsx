import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Building, Eye, EyeOff, Zap, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../contexts/SoundContext'
import BeybladeIcon from '../components/BeybladeIcon'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institute: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { register, isAuthenticated, loading } = useAuth()
  const { playSound } = useSound()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    if (name === 'password') {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength += 1
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    setPasswordStrength(strength)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'text-neon-red'
    if (passwordStrength <= 4) return 'text-neon-yellow'
    return 'text-neon-green'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 4) return 'Medium'
    return 'Strong'
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.institute.trim()) {
      newErrors.institute = 'Institute is required'
    } else if (formData.institute.trim().length < 2) {
      newErrors.institute = 'Institute must be at least 2 characters'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      playSound('defeat')
      return
    }

    playSound('click')
    const result = await register(
      formData.name.trim(),
      formData.email,
      formData.institute.trim(),
      formData.password
    )
    
    if (result.success) {
      playSound('victory')
      navigate('/', { replace: true })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beyblade-dark">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BeybladeIcon className="w-16 h-16 text-neon-blue" spinning={true} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beyblade-dark via-beyblade-purple/30 to-beyblade-violet/30 flex items-center justify-center p-4 pt-24 md:pt-28">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,246,255,0.1),transparent_50%)]" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <motion.div
          variants={itemVariants}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-neon-blue hover:text-neon-purple transition-colors duration-300 font-beyblade"
            onClick={() => playSound('click')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        {/* Register Card */}
        <motion.div
          variants={itemVariants}
          className="card-glow p-8 rounded-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mb-6 flex flex-col items-center space-y-6"
            >
              {/* Spin 2 Win Text */}
              <div className="text-4xl font-anime font-bold text-glow text-neon-blue">SPIN 2 WIN</div>

              {/* INQUIVESTA XII Text */}
              <div className="text-4xl font-anime font-bold text-glow text-neon-blue">INQUIVESTA XII</div>

              {/* IISER KOLKATA Logo */}
              <div className="flex items-center space-x-3">
                <img src="/assets/iiser_logo.png" alt="IISER KOLKATA" className="w-12 h-12 object-contain" />
                <span className="text-lg font-beyblade text-white/80">IISER KOLKATA</span>
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-anime font-bold text-glow mb-2">
              JOIN THE BATTLE
            </h1>
            <p className="text-white/80 font-beyblade">
              Create your account and start your Beyblade journey
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label className="block text-sm font-beyblade font-semibold text-white/80">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-beyblade-purple/20 border ${
                    errors.name ? 'border-neon-red' : 'border-neon-blue/30'
                  } text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-neon-red font-beyblade"
                >
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label className="block text-sm font-beyblade font-semibold text-white/80">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-beyblade-purple/20 border ${
                    errors.email ? 'border-neon-red' : 'border-neon-blue/30'
                  } text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-neon-red font-beyblade"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Institute Field */}
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label className="block text-sm font-beyblade font-semibold text-white/80">
                Institute/College
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue" />
                <input
                  type="text"
                  name="institute"
                  value={formData.institute}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-beyblade-purple/20 border ${
                    errors.institute ? 'border-neon-red' : 'border-neon-blue/30'
                  } text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300`}
                  placeholder="Enter your institute name"
                />
              </div>
              {errors.institute && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-neon-red font-beyblade"
                >
                  {errors.institute}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label className="block text-sm font-beyblade font-semibold text-white/80">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg bg-beyblade-purple/20 border ${
                    errors.password ? 'border-neon-red' : 'border-neon-blue/30'
                  } text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword)
                    playSound('click')
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-blue hover:text-neon-purple transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${getPasswordStrengthColor().replace('text-', 'from-')} to-neon-purple`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength / 6) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className={`text-xs font-beyblade ${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                </motion.div>
              )}
              
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-neon-red font-beyblade"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label className="block text-sm font-beyblade font-semibold text-white/80">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg bg-beyblade-purple/20 border ${
                    errors.confirmPassword ? 'border-neon-red' : 'border-neon-blue/30'
                  } text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmPassword(!showConfirmPassword)
                    playSound('click')
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-blue hover:text-neon-purple transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-neon-red font-beyblade"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>CREATING ACCOUNT...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>CREATE ACCOUNT</span>
                </div>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neon-blue/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-beyblade-dark text-white/60 font-beyblade">
                OR
              </span>
            </div>
          </motion.div>

          {/* Login Link */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <p className="text-white/80 font-beyblade mb-4">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="btn-secondary w-full text-center"
              onClick={() => playSound('click')}
            >
              SIGN IN
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register
