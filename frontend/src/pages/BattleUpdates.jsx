import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Zap, Eye, Crown, Sword, Shield, Target } from 'lucide-react'
import { useSound } from '../contexts/SoundContext'
import TournamentBracket from '../components/TournamentBracket'
import BladerModal from '../components/BladerModal'
import BladerTable from '../components/BladerTable'

const BattleUpdates = () => {
  const [bladers, setBladers] = useState([])
  const [matches, setMatches] = useState([])
  const [selectedBlader, setSelectedBlader] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState('arena') // 'arena' or 'name'
  const [loading, setLoading] = useState(true)
  const { playSound } = useSound()

  useEffect(() => {
    fetchBladers()
    fetchMatches()
  }, [])

  const fetchBladers = async () => {
    try {
      const response = await fetch('/api/bladers')
      const data = await response.json()
      setBladers(data.bladers || [])
    } catch (error) {
      console.error('Error fetching bladers:', error)
    }
  }

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBladerClick = (blader) => {
    setSelectedBlader(blader)
    setShowModal(true)
    playSound('click')
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedBlader(null)
    playSound('click')
  }

  const getRoundStats = () => {
    const stats = {
      elementary: bladers.filter(b => b.round === 'elementary' && !b.isEliminated).length,
      quarter: bladers.filter(b => b.round === 'quarter' && !b.isEliminated).length,
      semi: bladers.filter(b => b.round === 'semi' && !b.isEliminated).length,
      final: bladers.filter(b => b.round === 'final' && !b.isEliminated).length,
      champion: bladers.filter(b => b.round === 'champion').length
    }
    return stats
  }

  const stats = getRoundStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Trophy className="w-16 h-16 text-neon-blue" />
        </motion.div>
      </div>
    )
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
            <Trophy className="w-20 h-20 text-neon-gold mx-auto mb-6" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-anime font-black text-glow mb-6">
            BATTLE UPDATES
          </h1>
          
          <p className="text-xl md:text-2xl font-beyblade text-white/90 mb-8 max-w-4xl mx-auto">
            Witness the most intense Beyblade battles as bladers compete for ultimate glory
          </p>

          {/* View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-beyblade-purple/20 backdrop-blur-sm rounded-lg p-1 border border-neon-blue/30">
              <button
                onClick={() => {
                  setViewMode('arena')
                  playSound('click')
                }}
                className={`px-6 py-3 rounded-md font-beyblade font-semibold transition-all duration-300 ${
                  viewMode === 'arena'
                    ? 'bg-neon-blue text-beyblade-dark shadow-neon-blue'
                    : 'text-white hover:text-neon-blue'
                }`}
              >
                ARENA ID
              </button>
              <button
                onClick={() => {
                  setViewMode('name')
                  playSound('click')
                }}
                className={`px-6 py-3 rounded-md font-beyblade font-semibold transition-all duration-300 ${
                  viewMode === 'name'
                    ? 'bg-neon-blue text-beyblade-dark shadow-neon-blue'
                    : 'text-white hover:text-neon-blue'
                }`}
              >
                PLAYER NAME
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Tournament Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="py-8 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {[
              { round: 'Elementary', count: stats.elementary, icon: Users, color: 'text-neon-blue' },
              { round: 'Quarter', count: stats.quarter, icon: Sword, color: 'text-neon-red' },
              { round: 'Semi', count: stats.semi, icon: Shield, color: 'text-neon-yellow' },
              { round: 'Final', count: stats.final, icon: Target, color: 'text-neon-purple' },
              { round: 'Champion', count: stats.champion, icon: Crown, color: 'text-neon-gold' }
            ].map((stat, index) => (
              <motion.div
                key={stat.round}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="card-glow p-6 text-center bg-gradient-to-br from-beyblade-purple/20 to-beyblade-violet/20"
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <h3 className="text-2xl font-anime font-bold text-white mb-1">
                  {stat.count}
                </h3>
                <p className="text-sm font-beyblade text-white/80">
                  {stat.round}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Tournament Bracket */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="py-8 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-anime font-bold text-glow mb-4">
              TOURNAMENT BRACKET
            </h2>
            <p className="text-lg font-beyblade text-white/80">
              Click on any blader to view their details
            </p>
          </motion.div>

          <TournamentBracket
            bladers={bladers}
            matches={matches}
            viewMode={viewMode}
            onBladerClick={handleBladerClick}
          />
        </div>
      </motion.section>

      {/* Blader Leaderboard */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="py-16 px-4 bg-gradient-to-b from-transparent to-beyblade-purple/10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-anime font-bold text-glow mb-4">
              TOP 16 BLADERS
            </h2>
            <p className="text-lg font-beyblade text-white/80">
              The elite warriors competing for the championship
            </p>
          </motion.div>

          <BladerTable
            bladers={bladers.slice(0, 16)}
            onBladerClick={handleBladerClick}
          />
        </div>
      </motion.section>

      {/* Blader Modal */}
      <AnimatePresence>
        {showModal && selectedBlader && (
          <BladerModal
            blader={selectedBlader}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default BattleUpdates





