import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Calendar, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-t from-beyblade-dark via-beyblade-purple/20 to-transparent border-t border-neon-blue/30 mt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-neon-purple/5 to-neon-red/5" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-anime font-bold text-neon-blue mb-4">
              EVENT DETAILS
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/80">
                <Calendar className="w-5 h-5 text-neon-blue" />
                <span className="font-beyblade">11 Nov 2025 - 16 Jan 2026</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Clock className="w-5 h-5 text-neon-blue" />
                <span className="font-beyblade">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <MapPin className="w-5 h-5 text-neon-blue" />
                <span className="font-beyblade">INQUIVESTA XII Venue</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-anime font-bold text-neon-blue mb-4">
              QUICK LINKS
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Tournament Bracket', href: '/battle-updates' },
                { name: 'Live Quiz', href: '/live-quiz' },
                { name: 'Leaderboard', href: '/live-quiz#leaderboard' },
                { name: 'Rules & Regulations', href: '/contact' }
              ].map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="block text-white/80 hover:text-neon-blue transition-colors duration-300 font-beyblade"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-anime font-bold text-neon-blue mb-4">
              CONTACT US
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/80">
                <Mail className="w-5 h-5 text-neon-blue" />
                <span className="font-beyblade">inquivesta@example.com</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Phone className="w-5 h-5 text-neon-blue" />
                <span className="font-beyblade">+91 98765 43210</span>
              </div>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-anime font-bold text-neon-blue mb-4">
              FOLLOW US
            </h3>
            <div className="flex space-x-4">
              {[
                { icon: Instagram, href: '#', color: 'text-pink-400' },
                { icon: Facebook, href: '#', color: 'text-blue-400' },
                { icon: Twitter, href: '#', color: 'text-blue-300' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className={`p-3 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 hover:border-neon-purple/50 transition-all duration-300 ${social.color}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <social.icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-neon-blue/30"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-anime font-bold text-glow mb-2">
                SPIN 2 WIN
              </h4>
              <p className="text-white/60 font-beyblade">
                INQUIVESTA XII Beyblade Tournament
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-white/60 font-beyblade">
                © {currentYear} INQUIVESTA XII. All rights reserved.
              </p>
              <p className="text-white/40 font-beyblade text-sm mt-1">
                Powered by React & Node.js
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated background elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red opacity-50" />
    </footer>
  )
}

export default Footer





