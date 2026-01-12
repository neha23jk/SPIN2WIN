import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion'
import { Zap, Calendar, Clock, MapPin, Star, Trophy, Users, Brain } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../contexts/SoundContext'
import AnnouncementCard from '../components/AnnouncementCard'
import EventTimeline from '../components/EventTimeline'
import BeybladeIcon from '../components/BeybladeIcon'

const Home = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([])
  const [eventInfo, setEventInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const { playSound } = useSound()

  useEffect(() => {
    fetchAnnouncements()
    fetchEventInfo()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements?limit=5')
      const data = await response.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const fetchEventInfo = async () => {
    try {
      const response = await fetch('/api/event')
      const data = await response.json()
      setEventInfo(data.eventInfo)
    } catch (error) {
      console.error('Error fetching event info:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative py-20 px-4 text-center overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-beyblade-dark via-beyblade-purple/30 to-beyblade-violet/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,246,255,0.1),transparent_50%)]" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="mb-8 flex flex-col items-center space-y-6"
          >
            {/* Spin 2 Win Text */}
            <div className="text-5xl font-anime font-bold text-glow text-neon-blue">SPIN 2 WIN</div>

            {/* INQUIVESTA XII Text */}
            <div className="text-5xl font-anime font-bold text-glow text-neon-blue">INQUIVESTA XII</div>
            
            {/* IISER KOLKATA Logo */}
            <div className="flex items-center space-x-3">
              <img src="/assets/iiser_logo.png" alt="IISER KOLKATA" className="w-12 h-12 object-contain" />
              <span className="text-lg font-beyblade text-white/80">IISER KOLKATA</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-anime font-black text-glow mb-6"
            data-text="SPIN 2 WIN"
          >
            <span className="glitch" data-text="SPIN 2 WIN">SPIN 2 WIN</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl font-beyblade text-white/90 mb-8 max-w-4xl mx-auto"
          >
            Get ready to 'Spin 2 Win' at INQUIVESTA XII! This isn't just a Beyblade battle, 
            it's a high-octane fusion of physics, strategy, and pure adrenaline.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSound('click')
                //window.location.href = '/Register'
                navigate('/register');
              }}
              className="btn-secondary text-lg px-10 py-5"
            >
              <Zap className="w-5 h-5 mr-2" />
              JOIN THE BATTLE
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Event Info Cards */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-16 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {[
              {
                icon: Calendar,
                title: 'Event Date',
                value: '11 Nov 2025 - 16 Jan 2026',
                color: 'text-neon-blue',
                bgColor: 'from-neon-blue/20 to-neon-purple/20'
              },
              {
                icon: Clock,
                title: 'Duration',
                value: '2 Months',
                color: 'text-neon-red',
                bgColor: 'from-neon-red/20 to-neon-yellow/20'
              },
              {
                icon: MapPin,
                title: 'Location',
                value: 'INQUIVESTA XII',
                color: 'text-neon-yellow',
                bgColor: 'from-neon-yellow/20 to-neon-green/20'
              },
              {
                icon: Users,
                title: 'Participants',
                value: '16 Bladers',
                color: 'text-neon-purple',
                bgColor: 'from-neon-purple/20 to-neon-pink/20'
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`card-glow p-6 text-center bg-gradient-to-br ${card.bgColor}`}
              >
                <card.icon className={`w-8 h-8 ${card.color} mx-auto mb-4`} />
                <h3 className="text-lg font-beyblade font-bold text-white mb-2">
                  {card.title}
                </h3>
                <p className={`text-sm font-beyblade ${card.color}`}>
                  {card.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Announcements Section */}
      <motion.section
        id="announcements"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-16 px-4 bg-gradient-to-b from-transparent to-beyblade-purple/10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-anime font-bold text-glow mb-4">
              ANNOUNCEMENTS
            </h2>
            <p className="text-xl font-beyblade text-white/80">
              Stay updated with the latest tournament news
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <AnnouncementCard
                  key={announcement._id}
                  announcement={announcement}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                variants={itemVariants}
                className="col-span-full text-center py-12"
              >
                <Star className="w-16 h-16 text-neon-blue mx-auto mb-4 opacity-50" />
                <p className="text-white/60 font-beyblade text-lg">
                  No announcements yet. Check back soon!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Event Timeline */}
      <motion.section
        id="timeline"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-16 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-anime font-bold text-glow mb-4">
              EVENT TIMELINE
            </h2>
            <p className="text-xl font-beyblade text-white/80">
              Follow the journey from registration to championship
            </p>
          </motion.div>

          <EventTimeline />
        </div>
      </motion.section>

      {/* Detailed Description */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-16 px-4 bg-gradient-to-b from-beyblade-purple/10 to-transparent"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="card-glow p-8 md:p-12 text-center"
          >
            <Trophy className="w-16 h-16 text-neon-yellow mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-anime font-bold text-glow mb-6">
              THE ULTIMATE BEYBLADE EXPERIENCE
            </h3>
            <div className="prose prose-lg max-w-none text-white/90 font-beyblade leading-relaxed">
              <p className="mb-6">
                Welcome to the most electrifying Beyblade tournament of the year! 
                INQUIVESTA XII presents "Spin 2 Win" - where strategy meets speed, 
                and only the strongest bladers will emerge victorious.
              </p>
              <p className="mb-6">
                Our tournament features a unique blend of competitive battles, 
                live quizzes testing your Beyblade knowledge, and real-time 
                updates that keep you on the edge of your seat. Whether you're 
                a seasoned blader or new to the arena, there's something for everyone.
              </p>
              <p>
                Join us for an unforgettable journey through the world of Beyblade, 
                where every spin counts and every battle matters. The championship 
                awaits - are you ready to spin to win?
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}

export default Home
