import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Users, 
  Trophy, 
  Brain, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../contexts/SoundContext'
import { useNavigate } from 'react-router-dom'
import AdminAnnouncements from '../components/admin/AdminAnnouncements'
import AdminBladers from '../components/admin/AdminBladers'
import AdminMatches from '../components/admin/AdminMatches'
import AdminQuizSets from '../components/admin/AdminQuizSets'
import AdminLeaderboard from '../components/admin/AdminLeaderboard'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('announcements')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBladers: 0,
    activeQuizzes: 0,
    totalMatches: 0
  })
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const { playSound } = useSound()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        console.error('Failed to fetch dashboard stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'announcements', name: 'Announcements', icon: Settings, color: 'text-neon-blue' },
    { id: 'bladers', name: 'Bladers', icon: Users, color: 'text-neon-green' },
    { id: 'matches', name: 'Matches', icon: Trophy, color: 'text-neon-yellow' },
    { id: 'quiz-sets', name: 'Live Quizzes', icon: Brain, color: 'text-neon-purple' },
    { id: 'leaderboard', name: 'Leaderboard', icon: BarChart3, color: 'text-neon-red' }
  ]

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    playSound('click')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    playSound('click')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'announcements':
        return <AdminAnnouncements />
      case 'bladers':
        return <AdminBladers />
      case 'matches':
        return <AdminMatches />
      case 'quiz-sets':
        return <AdminQuizSets />
      case 'leaderboard':
        return <AdminLeaderboard />
      default:
        return <AdminAnnouncements />
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
      <div className="min-h-screen flex items-center justify-center pt-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Settings className="w-16 h-16 text-neon-blue" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-beyblade-dark via-beyblade-purple/10 to-beyblade-dark">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-16 px-4 text-center"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <Settings className="w-20 h-20 text-neon-blue mx-auto mb-6" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-anime font-black text-glow mb-6">
            ADMIN DASHBOARD
          </h1>
          
          <p className="text-xl md:text-2xl font-beyblade text-white/90 mb-8 max-w-4xl mx-auto">
            Manage the Spin 2 Win tournament and quiz system
          </p>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-glow p-6 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-anime font-bold text-neon-blue mb-2">
              Welcome, {user?.name}!
            </h2>
            <p className="text-white/80 font-beyblade">
              You have full administrative access to manage the tournament, quizzes, and announcements.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Cards */}
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              { 
                title: 'Total Users', 
                value: stats.totalUsers, 
                icon: Users, 
                color: 'text-neon-blue',
                bgColor: 'from-neon-blue/20 to-neon-purple/20'
              },
              { 
                title: 'Active Bladers', 
                value: stats.totalBladers, 
                icon: Trophy, 
                color: 'text-neon-green',
                bgColor: 'from-neon-green/20 to-neon-teal/20'
              },
              { 
                title: 'Active Quizzes', 
                value: stats.activeQuizzes, 
                icon: Brain, 
                color: 'text-neon-yellow',
                bgColor: 'from-neon-yellow/20 to-neon-orange/20'
              },
              { 
                title: 'Total Matches', 
                value: stats.totalMatches, 
                icon: BarChart3, 
                color: 'text-neon-purple',
                bgColor: 'from-neon-purple/20 to-neon-pink/20'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`card-glow p-6 text-center bg-gradient-to-br ${stat.bgColor}`}
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
                <h3 className="text-3xl font-anime font-bold text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm font-beyblade text-white/80">
                  {stat.title}
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
        animate="visible"
        className="max-w-7xl mx-auto px-4 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <div className="card-glow p-6 sticky top-24">
              <h3 className="text-xl font-anime font-bold text-neon-blue mb-6">
                ADMIN PANEL
              </h3>
              
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50'
                          : 'text-white/80 hover:text-neon-blue hover:bg-neon-blue/10'
                      }`}
                    >
                      <TabIcon className="w-5 h-5" />
                      <span className="font-beyblade font-semibold">
                        {tab.name}
                      </span>
                    </motion.button>
                  )
                })}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-neon-blue/30">
                <h4 className="text-sm font-beyblade font-bold text-white/60 mb-4 uppercase">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-beyblade text-white/80 hover:text-neon-green hover:bg-neon-green/10 transition-all duration-300"
                    onClick={() => {
                      fetchStats()
                      playSound('click')
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Refresh Data</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-beyblade text-white/80 hover:text-neon-red hover:bg-neon-red/10 transition-all duration-300"
                    onClick={handleLogout}
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-3"
          >
            <div className="card-glow p-8">
              {renderTabContent()}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard




