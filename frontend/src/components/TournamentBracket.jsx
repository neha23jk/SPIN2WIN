import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Sword, Shield, Target } from 'lucide-react'
import BeybladeIcon from './BeybladeIcon'

const TournamentBracket = ({ bladers, matches, viewMode, onBladerClick }) => {
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
      case 'elementary': return 'text-neon-blue border-neon-blue/50'
      case 'quarter': return 'text-neon-red border-neon-red/50'
      case 'semi': return 'text-neon-yellow border-neon-yellow/50'
      case 'final': return 'text-neon-purple border-neon-purple/50'
      case 'champion': return 'text-neon-gold border-neon-gold/50'
      default: return 'text-neon-blue border-neon-blue/50'
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

  const rounds = ['elementary', 'quarter', 'semi', 'final', 'champion']
  
  const getBladersByRound = (round) => {
    return bladers.filter(blader => blader.round === round)
  }

  const getMatchesByRound = (round) => {
    return matches.filter(match => match.round === round)
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {rounds.map((round, roundIndex) => {
        const roundBladers = getBladersByRound(round)
        const roundMatches = getMatchesByRound(round)
        const RoundIcon = getRoundIcon(round)
        const roundColor = getRoundColor(round)
        const roundBgColor = getRoundBgColor(round)

        return (
          <motion.div
            key={round}
            variants={itemVariants}
            className="relative"
          >
            {/* Round Header */}
            <div className="flex items-center justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg bg-gradient-to-r ${roundBgColor} border ${roundColor.split(' ')[1]} shadow-glow`}
              >
                <RoundIcon className={`w-6 h-6 ${roundColor.split(' ')[0]}`} />
                <h3 className="text-xl font-anime font-bold text-white uppercase">
                  {round} Round
                </h3>
                <span className={`text-sm font-beyblade px-2 py-1 rounded-full bg-black/20 ${roundColor.split(' ')[0]}`}>
                  {roundBladers.length} Bladers
                </span>
              </motion.div>
            </div>

            {/* Bladers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
              {roundBladers.map((blader, bladerIndex) => (
                <motion.div
                  key={blader._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onBladerClick(blader)}
                  className={`card-glow p-4 text-center cursor-pointer bg-gradient-to-br ${roundBgColor} border ${roundColor.split(' ')[1]} hover:shadow-glow transition-all duration-300 group`}
                >
                  {/* Battle Code */}
                  <div className="mb-2">
                    <span className={`text-xs font-beyblade font-bold ${roundColor.split(' ')[0]} px-2 py-1 rounded-full bg-black/20`}>
                      {blader.battleNumber}
                    </span>
                  </div>

                  {/* Beyblade Icon */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mb-3"
                  >
                    <BeybladeIcon 
                      className="w-8 h-8 mx-auto text-neon-blue group-hover:text-neon-purple transition-colors duration-300" 
                      spinning={true}
                    />
                  </motion.div>

                  {/* Blader Info */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-beyblade font-bold text-white truncate">
                      {viewMode === 'arena' ? blader.arenaId : blader.name}
                    </h4>
                    <p className="text-xs text-white/70 font-beyblade truncate">
                      {viewMode === 'arena' ? blader.name : blader.institute}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="mt-3 flex justify-center space-x-2 text-xs font-beyblade">
                    <span className="text-neon-green">
                      W: {blader.wins || 0}
                    </span>
                    <span className="text-neon-red">
                      L: {blader.losses || 0}
                    </span>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                </motion.div>
              ))}
            </div>

            {/* Round Separator */}
            {roundIndex < rounds.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-neon-blue to-transparent"
              />
            )}
          </motion.div>
        )
      })}

      {/* Championship Celebration */}
      {getBladersByRound('champion').length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-4"
          >
            <Crown className="w-16 h-16 text-neon-gold" />
          </motion.div>
          
          <h3 className="text-3xl font-anime font-bold text-glow mb-2">
            CHAMPION CROWNED
          </h3>
          <p className="text-white/80 font-beyblade text-lg">
            The ultimate Beyblade warrior has been determined!
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default TournamentBracket





