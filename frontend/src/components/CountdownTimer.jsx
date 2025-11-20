import React from 'react'
import { motion } from 'framer-motion'

const CountdownTimer = ({ timeRemaining, onTimeUp }) => {
  const getTimerColor = (time) => {
    if (time > 20) return 'text-neon-green'
    if (time > 10) return 'text-neon-yellow'
    return 'text-neon-red'
  }

  const getTimerBgColor = (time) => {
    if (time > 20) return 'bg-neon-green/20 border-neon-green/50'
    if (time > 10) return 'bg-neon-yellow/20 border-neon-yellow/50'
    return 'bg-neon-red/20 border-neon-red/50'
  }

  const getPulseClass = (time) => {
    if (time <= 10) return 'animate-pulse'
    if (time <= 5) return 'animate-ping'
    return ''
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 font-beyblade font-bold text-lg ${getTimerBgColor(timeRemaining)} ${getTimerColor(timeRemaining)} ${getPulseClass(timeRemaining)}`}
    >
      <motion.span
        key={timeRemaining}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="tabular-nums"
      >
        {timeRemaining}
      </motion.span>
      <span className="ml-1 text-sm">s</span>
    </motion.div>
  )
}

export default CountdownTimer





