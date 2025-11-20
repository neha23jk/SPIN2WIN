import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../contexts/SoundContext'
import BeybladeIcon from './BeybladeIcon'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { playSound } = useSound()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMenuToggle = () => {
    setIsOpen(!isOpen)
    playSound('click')
  }

  const handleLogout = () => {
    logout()
    playSound('click')
    setIsOpen(false)
  }

  const navItems = [
    { name: 'HOME', path: '/', icon: '🏠' },
    { name: 'BATTLE UPDATES', path: '/battle-updates', icon: '⚔️' },
    { name: 'LIVE QUIZ', path: '/live-quiz', icon: '🧠' },
    { name: 'CONTACT US', path: '/contact', icon: '💬' }
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-beyblade-dark/90 backdrop-blur-md border-b border-neon-blue/30 shadow-glow' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={() => playSound('hover')}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <BeybladeIcon className="w-8 h-8 text-neon-blue" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-neon-blue opacity-0 group-hover:opacity-100"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
            <span className="text-xl font-anime font-bold text-glow">
              SPIN 2 WIN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative group px-3 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'text-neon-blue shadow-neon-blue'
                    : 'text-white hover:text-neon-blue'
                }`}
                onClick={() => playSound('hover')}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-beyblade font-semibold">{item.name}</span>
                </span>
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 group-hover:opacity-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-neon-blue">
                  <User className="w-5 h-5" />
                  <span className="font-beyblade font-semibold">{user?.name}</span>
                </div>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-neon-red/20 to-neon-yellow/20 border border-neon-red/30 hover:border-neon-yellow/50 transition-all duration-300"
                    onClick={() => playSound('click')}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-beyblade text-sm">ADMIN</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-neon-red/20 to-neon-purple/20 border border-neon-red/30 hover:border-neon-purple/50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-beyblade text-sm">LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10 transition-all duration-300 font-beyblade"
                  onClick={() => playSound('click')}
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="btn-primary font-beyblade"
                  onClick={() => playSound('click')}
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-lg text-neon-blue hover:bg-neon-blue/10 transition-all duration-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-beyblade-dark/95 backdrop-blur-md border-t border-neon-blue/30"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50'
                      : 'text-white hover:bg-neon-blue/10 hover:text-neon-blue'
                  }`}
                  onClick={() => {
                    playSound('click')
                    setIsOpen(false)
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-beyblade font-semibold">{item.name}</span>
                </Link>
              ))}
              
              <div className="border-t border-neon-blue/30 pt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-3 text-neon-blue">
                      <User className="w-5 h-5" />
                      <span className="font-beyblade font-semibold">{user?.name}</span>
                    </div>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-neon-red/20 to-neon-yellow/20 border border-neon-red/30 hover:border-neon-yellow/50 transition-all duration-300"
                        onClick={() => {
                          playSound('click')
                          setIsOpen(false)
                        }}
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-beyblade font-semibold">ADMIN DASHBOARD</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-neon-red/20 to-neon-purple/20 border border-neon-red/30 hover:border-neon-purple/50 transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-beyblade font-semibold">LOGOUT</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block w-full px-4 py-3 rounded-lg border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10 transition-all duration-300 font-beyblade text-center"
                      onClick={() => {
                        playSound('click')
                        setIsOpen(false)
                      }}
                    >
                      LOGIN
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full btn-primary font-beyblade text-center"
                      onClick={() => {
                        playSound('click')
                        setIsOpen(false)
                      }}
                    >
                      REGISTER
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
