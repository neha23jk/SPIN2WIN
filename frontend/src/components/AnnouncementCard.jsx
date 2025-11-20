import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, User, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react'

const AnnouncementCard = ({ announcement, index }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-neon-red" />
      case 'high':
        return <XCircle className="w-5 h-5 text-neon-yellow" />
      case 'medium':
        return <Info className="w-5 h-5 text-neon-blue" />
      case 'low':
        return <CheckCircle className="w-5 h-5 text-neon-green" />
      default:
        return <Info className="w-5 h-5 text-neon-blue" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-neon-red/50 bg-gradient-to-br from-neon-red/20 to-neon-pink/20'
      case 'high':
        return 'border-neon-yellow/50 bg-gradient-to-br from-neon-yellow/20 to-neon-orange/20'
      case 'medium':
        return 'border-neon-blue/50 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20'
      case 'low':
        return 'border-neon-green/50 bg-gradient-to-br from-neon-green/20 to-neon-teal/20'
      default:
        return 'border-neon-blue/50 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`card-glow p-6 border ${getPriorityColor(announcement.priority)} hover:shadow-glow transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getPriorityIcon(announcement.priority)}
          <span className="text-sm font-beyblade font-semibold text-white/80 uppercase">
            {announcement.priority}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-white/60">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-beyblade">
            {formatDate(announcement.createdAt)}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-anime font-bold text-white mb-3 line-clamp-2">
        {announcement.title}
      </h3>

      <p className="text-white/80 font-beyblade text-sm mb-4 line-clamp-3">
        {announcement.message}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white/60">
          <User className="w-4 h-4" />
          <span className="text-xs font-beyblade">
            {announcement.author?.name || 'Admin'}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-xs font-beyblade text-neon-blue hover:text-neon-purple transition-colors duration-300"
        >
          READ MORE
        </motion.button>
      </div>
    </motion.div>
  )
}

export default AnnouncementCard





