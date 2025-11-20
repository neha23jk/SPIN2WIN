import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Users, Zap, Target, Shield, Sword, Crown, Award, TrendingUp } from 'lucide-react'
import BeybladeIcon from './BeybladeIcon'

const BladerModal = ({ blader, onClose }) => {
  if (!blader) return null

  const getRoundIcon = (round) => {
    switch (round) {
      case 'elementary': return Sword
      case 'quarter': return Shield
      case 'semi': return Target
      case 'final': return Trophy
      case 'champion': return Crown
      default: return Sword
    }
  }

  const getRoundColor = (round) => {
    switch (round) {
      case 'elementary': return 'text-neon-blue'
      case 'quarter': return 'text-neon-red'
      case 'semi': return 'text-neon-yellow'
      case 'final': return 'text-neon-purple'
      case 'champion': return 'text-neon-gold'
      default: return 'text-neon-blue'
    }
  }

  const getRoundBgColor = (round) => {
    switch (round) {
      case 'elementary': return 'from-neon-blue/20 to-neon-purple/20'
      case 'quarter': return 'from-neon-red/20 to-neon-pink/20'
      case 'semi': return 'from-neon-yellow/20 to-neon-orange/20'
      case 'final': return 'from-neon-purple/20 to-neon-indigo/20'
      case 'champion': return 'from-neon-gold/20 to-neon-yellow/20'
      default: return 'from-neon-blue/20 to-neon-purple/20'
    }
  }

  const RoundIcon = getRoundIcon(blader.round)
  const roundColor = getRoundColor(blader.round)
  const roundBgColor = getRoundBgColor(blader.round)

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-beyblade-dark via-beyblade-purple/20 to-beyblade-violet/20 backdrop-blur-md rounded-2xl border border-neon-blue/30 shadow-glow"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neon-red/20 hover:bg-neon-red/30 text-neon-red transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className={`relative p-8 bg-gradient-to-r ${roundBgColor} rounded-t-2xl`}>
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <BeybladeIcon className="w-16 h-16 text-neon-blue" spinning={true} />
              </motion.div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-anime font-bold text-white mb-2">
                  {blader.name}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className={`text-lg font-beyblade font-semibold ${roundColor} flex items-center space-x-2`}>
                    <RoundIcon className="w-5 h-5" />
                    <span>{blader.round.toUpperCase()} ROUND</span>
                  </span>
                  <span className="text-sm font-beyblade text-white/80 bg-black/20 px-3 py-1 rounded-full">
                    {blader.arenaId}
                  </span>
                </div>
              </div>
            </div>

            {/* Battle Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-anime font-bold text-white">
                  {blader.battleNumber}
                </div>
                <div className="text-xs font-beyblade text-white/80">
                  BATTLE CODE
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-anime font-bold text-neon-green">
                  {blader.wins || 0}
                </div>
                <div className="text-xs font-beyblade text-white/80">
                  WINS
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-anime font-bold text-neon-red">
                  {blader.losses || 0}
                </div>
                <div className="text-xs font-beyblade text-white/80">
                  LOSSES
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-anime font-bold text-neon-yellow">
                  {blader.stats?.totalBattles || 0}
                </div>
                <div className="text-xs font-beyblade text-white/80">
                  TOTAL BATTLES
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-anime font-bold text-neon-blue mb-3">
                  BLADER DETAILS
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-beyblade text-white/60 block mb-1">
                      ARENA ID
                    </label>
                    <div className="text-white font-beyblade font-semibold">
                      {blader.arenaId}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-beyblade text-white/60 block mb-1">
                      INSTITUTE
                    </label>
                    <div className="text-white font-beyblade">
                      {blader.institute}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-beyblade text-white/60 block mb-1">
                      BEY COMBO
                    </label>
                    <div className="text-white font-beyblade font-semibold">
                      {blader.beyCombo}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-anime font-bold text-neon-purple mb-3">
                  BATTLE STATISTICS
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-beyblade text-white/60">
                      Win Percentage
                    </span>
                    <span className="text-white font-beyblade font-semibold">
                      {blader.wins + blader.losses > 0 
                        ? Math.round((blader.wins / (blader.wins + blader.losses)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-beyblade text-white/60">
                      Burst Finishes
                    </span>
                    <span className="text-neon-red font-beyblade font-semibold">
                      {blader.stats?.burstFinishes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-beyblade text-white/60">
                      Spin Finishes
                    </span>
                    <span className="text-neon-blue font-beyblade font-semibold">
                      {blader.stats?.spinFinishes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-beyblade text-white/60">
                      Ring Out Finishes
                    </span>
                    <span className="text-neon-yellow font-beyblade font-semibold">
                      {blader.stats?.ringOutFinishes || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="space-y-4">
              <h3 className="text-xl font-anime font-bold text-neon-yellow mb-3">
                PERFORMANCE OVERVIEW
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-glow p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-neon-green mx-auto mb-2" />
                  <div className="text-2xl font-anime font-bold text-white">
                    {blader.stats?.averageBattleTime || 0}s
                  </div>
                  <div className="text-xs font-beyblade text-white/60">
                    AVG BATTLE TIME
                  </div>
                </div>
                <div className="card-glow p-4 text-center">
                  <Award className="w-8 h-8 text-neon-blue mx-auto mb-2" />
                  <div className="text-2xl font-anime font-bold text-white">
                    {blader.totalScore || 0}
                  </div>
                  <div className="text-xs font-beyblade text-white/60">
                    TOTAL SCORE
                  </div>
                </div>
                <div className="card-glow p-4 text-center">
                  <Zap className="w-8 h-8 text-neon-purple mx-auto mb-2" />
                  <div className="text-2xl font-anime font-bold text-white">
                    {blader.isEliminated ? 'ELIMINATED' : 'ACTIVE'}
                  </div>
                  <div className="text-xs font-beyblade text-white/60">
                    STATUS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BladerModal





