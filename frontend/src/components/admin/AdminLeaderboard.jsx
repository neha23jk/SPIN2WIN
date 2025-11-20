import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Award, BarChart3, TrendingUp } from 'lucide-react'
import { useSound } from '../../contexts/SoundContext'

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const { playSound } = useSound()

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/responses/leaderboard?limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-neon-gold" />
      case 1:
        return <Trophy className="w-6 h-6 text-neon-silver" />
      case 2:
        return <Medal className="w-6 h-6 text-neon-bronze" />
      default:
        return <Award className="w-5 h-5 text-white/60" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-anime font-bold text-glow">
          LEADERBOARD
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            fetchLeaderboard()
            playSound('click')
          }}
          className="btn-secondary"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          REFRESH
        </motion.button>
      </div>

      <div className="space-y-3">
        {leaderboard.map((player, index) => (
          <motion.div
            key={player._id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            className={`flex items-center justify-between p-4 rounded-lg border ${getRankColor(index)} transition-all duration-300`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10">
                {getRankIcon(index)}
              </div>
              <div>
                <div className="font-beyblade font-bold text-lg">
                  {player.name}
                </div>
                <div className="text-sm opacity-70">
                  {player.institute}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-anime font-bold text-2xl">
                {player.totalScore || 0}
              </div>
              <div className="text-sm opacity-70">
                {player.accuracy || 0}% accuracy
              </div>
            </div>
          </motion.div>
        ))}

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-neon-blue mx-auto mb-4 opacity-50" />
            <p className="text-white/60 font-beyblade text-lg">
              No participants yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminLeaderboard
