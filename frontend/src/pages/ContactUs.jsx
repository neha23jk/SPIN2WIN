import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, MessageCircle, Send, Zap, Users, Clock, Calendar } from 'lucide-react'
import { useSound } from '../contexts/SoundContext'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { playSound } = useSound()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    playSound('click')
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
      playSound('notification')
    }, 2000)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'inquivesta@example.com',
      color: 'text-neon-blue',
      bgColor: 'from-neon-blue/20 to-neon-purple/20',
      borderColor: 'border-neon-blue/50'
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+91 98765 43210',
      color: 'text-neon-green',
      bgColor: 'from-neon-green/20 to-neon-teal/20',
      borderColor: 'border-neon-green/50'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'INQUIVESTA XII Venue',
      color: 'text-neon-yellow',
      bgColor: 'from-neon-yellow/20 to-neon-orange/20',
      borderColor: 'border-neon-yellow/50'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+91 98765 43210',
      color: 'text-neon-purple',
      bgColor: 'from-neon-purple/20 to-neon-pink/20',
      borderColor: 'border-neon-purple/50'
    }
  ]

  const socialLinks = [
    {
      icon: Instagram,
      name: 'Instagram',
      href: '#',
      color: 'text-pink-400',
      hoverColor: 'hover:text-pink-300'
    },
    {
      icon: Facebook,
      name: 'Facebook',
      href: '#',
      color: 'text-blue-400',
      hoverColor: 'hover:text-blue-300'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      href: '#',
      color: 'text-blue-300',
      hoverColor: 'hover:text-blue-200'
    }
  ]

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
    <div className="min-h-screen pt-16 bg-gradient-to-b from-beyblade-dark via-beyblade-purple/10 to-beyblade-dark">
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-16 px-4 text-center"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <Zap className="w-20 h-20 text-neon-blue mx-auto mb-6" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-anime font-black text-glow mb-6">
            CONTACT US
          </h1>
          
          <p className="text-xl md:text-2xl font-beyblade text-white/90 mb-8 max-w-4xl mx-auto">
            Get in touch with the Spin 2 Win team. We're here to help and answer your questions!
          </p>
        </div>
      </motion.section>

      {/* Contact Info Cards */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-8 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`card-glow p-6 text-center bg-gradient-to-br ${info.bgColor} border ${info.borderColor} hover:shadow-glow transition-all duration-300`}
              >
                <info.icon className={`w-8 h-8 ${info.color} mx-auto mb-4`} />
                <h3 className="text-lg font-beyblade font-bold text-white mb-2">
                  {info.title}
                </h3>
                <p className={`text-sm font-beyblade ${info.color}`}>
                  {info.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            variants={itemVariants}
            className="card-glow p-8"
          >
            <h2 className="text-3xl font-anime font-bold text-glow mb-6">
              SEND US A MESSAGE
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300 resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>SENDING...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>SEND MESSAGE</span>
                  </div>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Details & Social */}
          <motion.div
            variants={itemVariants}
            className="space-y-8"
          >
            {/* Event Details */}
            <div className="card-glow p-8">
              <h3 className="text-2xl font-anime font-bold text-neon-blue mb-6">
                EVENT DETAILS
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Calendar className="w-6 h-6 text-neon-yellow" />
                  <div>
                    <div className="font-beyblade font-semibold text-white">
                      Event Date
                    </div>
                    <div className="text-white/80 font-beyblade">
                      11 Nov 2025 - 16 Jan 2026
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Clock className="w-6 h-6 text-neon-green" />
                  <div>
                    <div className="font-beyblade font-semibold text-white">
                      Event Time
                    </div>
                    <div className="text-white/80 font-beyblade">
                      9:00 AM - 6:00 PM Daily
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Users className="w-6 h-6 text-neon-purple" />
                  <div>
                    <div className="font-beyblade font-semibold text-white">
                      Participants
                    </div>
                    <div className="text-white/80 font-beyblade">
                      16 Elite Bladers
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="card-glow p-8">
              <h3 className="text-2xl font-anime font-bold text-neon-purple mb-6">
                FOLLOW US
              </h3>
              
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-beyblade-purple/20 to-beyblade-violet/20 border border-neon-blue/30 hover:border-neon-purple/50 transition-all duration-300 ${social.color} ${social.hoverColor}`}
                    onClick={() => playSound('click')}
                  >
                    <social.icon className="w-6 h-6" />
                    <span className="font-beyblade font-semibold">
                      {social.name}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="card-glow p-8">
              <h3 className="text-2xl font-anime font-bold text-neon-yellow mb-6">
                QUICK LINKS
              </h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Tournament Rules', href: '/battle-updates' },
                  { name: 'Registration Info', href: '/register' },
                  { name: 'Live Leaderboard', href: '/live-quiz#leaderboard' },
                  { name: 'Event Schedule', href: '/#timeline' }
                ].map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="block text-white/80 hover:text-neon-blue transition-colors duration-300 font-beyblade"
                    onClick={() => playSound('click')}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default ContactUs





