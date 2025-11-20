import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Sword, Shield, Target, TrendingUp, Award } from 'lucide-react'
import BeybladeIcon from './BeybladeIcon'

const BladerTable = ({ bladers, onBladerClick }) => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="overflow-hidden rounded-xl border border-neon-blue/30 bg-gradient-to-br from-beyblade-purple/10 to-beyblade-violet/10"
    >
      {/* Table Header */}
      <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 px-6 py-4 border-b border-neon-blue/30">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1 text-center">
            <span className="text-sm font-beyblade font-bold text-neon-blue">#</span>
          </div>
          <div className="col-span-2 text-center">
            <span className="text-sm font-beyblade font-bold text-neon-blue">ARENA ID</span>
          </div>
          <div className="col-span-3 text-center">
            <span className="text-sm font-beyblade font-bold text-neon-blue">NAME</span>
          </div>
          <div className="col-span-3 text-center">
            <span className="text-sm font-beyblade font-bold text-neon-blue">INSTITUTE</span>
          </div>
          <div className="col-span-1 text-center">
            <span className="text-sm font-beyblade font-bold text-neon-blue">ROUND</span>
          </div>
          <div className="col-span-2 text-center">
            <span className="text-sm font-beyblade font-bold text-neon-blue">STATS</span>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-neon-blue/20">
        {bladers.map((blader, index) => {
          const RoundIcon = getRoundIcon(blader.round)
          const roundColor = getRoundColor(blader.round)
          const winPercentage = blader.wins + blader.losses > 0 
            ? Math.round((blader.wins / (blader.wins + blader.losses)) * 100)
            : 0

          return (
            <motion.div
              key={blader._id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: 'rgba(0, 246, 255, 0.05)'
              }}
              onClick={() => onBladerClick(blader)}
              className="grid grid-cols-12 gap-4 items-center px-6 py-4 cursor-pointer transition-all duration-300 hover:bg-neon-blue/5 group"
            >
              {/* Rank */}
              <div className="col-span-1 text-center">
                <div className="flex items-center justify-center">
                  {index < 3 ? (
                    <Trophy className={`w-5 h-5 ${index === 0 ? 'text-neon-gold' : index === 1 ? 'text-neon-silver' : 'text-neon-bronze'}`} />
                  ) : (
                    <span className="text-sm font-beyblade font-bold text-white/80">
                      {index + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Arena ID */}
              <div className="col-span-2 text-center">
                <span className="text-sm font-beyblade font-semibold text-neon-blue group-hover:text-neon-purple transition-colors duration-300">
                  {blader.arenaId}
                </span>
              </div>

              {/* Name */}
              <div className="col-span-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <BeybladeIcon className="w-5 h-5 text-neon-blue group-hover:text-neon-purple transition-colors duration-300" />
                  </motion.div>
                  <span className="text-sm font-beyblade font-semibold text-white truncate">
                    {blader.name}
                  </span>
                </div>
              </div>

              {/* Institute */}
              <div className="col-span-3 text-center">
                <span className="text-sm font-beyblade text-white/80 truncate">
                  {blader.institute}
                </span>
              </div>

              {/* Round */}
              <div className="col-span-1 text-center">
                <div className="flex items-center justify-center">
                  <RoundIcon className={`w-4 h-4 ${roundColor}`} />
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center space-x-3 text-xs font-beyblade">
                  <div className="flex items-center space-x-1">
                    <span className="text-neon-green">W</span>
                    <span className="text-white">{blader.wins || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-neon-red">L</span>
                    <span className="text-white">{blader.losses || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-neon-yellow">%</span>
                    <span className="text-white">{winPercentage}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Table Footer */}
      <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 px-6 py-4 border-t border-neon-blue/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-neon-yellow" />
            <span className="text-sm font-beyblade text-white/80">
              Top 16 Elite Bladers
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-beyblade text-white/80">
              Live Rankings
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default BladerTable





