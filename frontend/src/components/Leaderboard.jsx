import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Award, TrendingUp, Users } from 'lucide-react'

const Leaderboard = ({ leaderboard }) => {
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-neon-gold" />
      case 1:
        return <Trophy className="w-5 h-5 text-neon-silver" />
      case 2:
        return <Medal className="w-5 h-5 text-neon-bronze" />
      default:
        return <Award className="w-4 h-4 text-white/60" />
    }
  }

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return 'text-neon-gold bg-gradient-to-r from-neon-gold/20 to-neon-yellow/20 border-neon-gold/50'
      case 1:
        return 'text-neon-silver bg-gradient-to-r from-neon-silver/20 to-neon-gray/20 border-neon-silver/50'
      case 2:
        return 'text-neon-bronze bg-gradient-to-r from-neon-bronze/20 to-neon-orange/20 border-neon-bronze/50'
      default:
        return 'text-white/80 bg-gradient-to-r from-white/10 to-white/5 border-white/20'
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <Users className="w-12 h-12 text-neon-blue mx-auto mb-4 opacity-50" />
        <p className="text-white/60 font-beyblade">
          No participants yet
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {leaderboard.slice(0, 10).map((player, index) => (
        <motion.div
          key={player._id || index}
          variants={itemVariants}
          whileHover={{ scale: 1.02, x: 5 }}
          className={`flex items-center justify-between p-3 rounded-lg border ${getRankColor(index)} transition-all duration-300`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8">
              {getRankIcon(index)}
            </div>
            <div>
              <div className="font-beyblade font-semibold text-sm truncate max-w-32">
                {player.name}
              </div>
              <div className="text-xs opacity-70 truncate max-w-32">
                {player.institute}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-anime font-bold text-lg">
              {player.totalScore || 0}
            </div>
            <div className="text-xs opacity-70">
              {player.accuracy || 0}% acc
            </div>
          </div>
        </motion.div>
      ))}

      {/* Leaderboard Stats */}
      <motion.div
        variants={itemVariants}
        className="mt-6 pt-4 border-t border-white/20"
      >
        <div className="flex items-center justify-between text-xs font-beyblade text-white/60">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Live Rankings</span>
          </div>
          <span>{leaderboard.length} participants</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Leaderboard





