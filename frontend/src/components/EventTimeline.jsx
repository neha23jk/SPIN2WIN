import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Trophy, Brain, Users, Zap, Star } from 'lucide-react'

const EventTimeline = () => {
  const timelineEvents = [
    {
      date: '11 Nov 2025',
      title: 'Registration Opens',
      description: 'Sign up for the ultimate Beyblade tournament',
      icon: Users,
      color: 'text-neon-blue',
      bgColor: 'from-neon-blue/20 to-neon-purple/20',
      borderColor: 'border-neon-blue/50'
    },
    {
      date: '10 Jan 2026',
      title: 'Online Quiz Begins',
      description: 'Test your Beyblade knowledge and strategy',
      icon: Brain,
      color: 'text-neon-yellow',
      bgColor: 'from-neon-yellow/20 to-neon-orange/20',
      borderColor: 'border-neon-yellow/50'
    },
    {
      date: '11 Jan 2026',
      title: 'Quiz Results',
      description: 'See who has the sharpest mind',
      icon: Star,
      color: 'text-neon-green',
      bgColor: 'from-neon-green/20 to-neon-teal/20',
      borderColor: 'border-neon-green/50'
    },
    {
      date: '12 Jan 2026',
      title: 'Elementary Round',
      description: '16 → 8 bladers advance',
      icon: Zap,
      color: 'text-neon-red',
      bgColor: 'from-neon-red/20 to-neon-pink/20',
      borderColor: 'border-neon-red/50'
    },
    {
      date: '13 Jan 2026',
      title: 'Quarter Finals',
      description: '8 → 4 bladers advance',
      icon: Zap,
      color: 'text-neon-purple',
      bgColor: 'from-neon-purple/20 to-neon-indigo/20',
      borderColor: 'border-neon-purple/50'
    },
    {
      date: '14 Jan 2026',
      title: 'Semi Finals',
      description: '4 → 2 bladers advance',
      icon: Zap,
      color: 'text-neon-pink',
      bgColor: 'from-neon-pink/20 to-neon-rose/20',
      borderColor: 'border-neon-pink/50'
    },
    {
      date: '15 Jan 2026',
      title: 'Final Battle',
      description: '2 → 1 champion emerges',
      icon: Trophy,
      color: 'text-neon-yellow',
      bgColor: 'from-neon-yellow/20 to-neon-gold/20',
      borderColor: 'border-neon-yellow/50'
    },
    {
      date: '16 Jan 2026',
      title: 'Championship Ceremony',
      description: 'Celebrate the ultimate winner',
      icon: Trophy,
      color: 'text-neon-gold',
      bgColor: 'from-neon-gold/20 to-neon-yellow/20',
      borderColor: 'border-neon-gold/50'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-blue via-neon-purple to-neon-red opacity-50" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-8"
      >
        {timelineEvents.map((event, index) => (
          <motion.div
            key={event.date}
            variants={itemVariants}
            className="relative flex items-start space-x-6"
          >
            {/* Timeline dot */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-br ${event.bgColor} border-2 ${event.borderColor} flex items-center justify-center shadow-glow`}
            >
              <event.icon className={`w-8 h-8 ${event.color}`} />
              
              {/* Pulsing effect */}
              <motion.div
                className={`absolute inset-0 rounded-full border-2 ${event.borderColor} opacity-0`}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: index * 0.3 
                }}
              />
            </motion.div>

            {/* Event content */}
            <motion.div
              whileHover={{ scale: 1.02, x: 10 }}
              className={`flex-1 card-glow p-6 bg-gradient-to-br ${event.bgColor} border ${event.borderColor} hover:shadow-glow transition-all duration-300`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <h3 className="text-xl font-anime font-bold text-white mb-2 md:mb-0">
                  {event.title}
                </h3>
                <span className={`text-sm font-beyblade font-semibold ${event.color} px-3 py-1 rounded-full bg-black/20`}>
                  {event.date}
                </span>
              </div>
              
              <p className="text-white/80 font-beyblade text-sm">
                {event.description}
              </p>

              {/* Progress indicator */}
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex-1 h-1 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${event.bgColor.replace('/20', '')}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                <span className="text-xs font-beyblade text-white/60">
                  {index + 1}/{timelineEvents.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Final celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-12 text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block"
        >
          <Trophy className="w-16 h-16 text-neon-gold mx-auto mb-4" />
        </motion.div>
        
        <h3 className="text-2xl font-anime font-bold text-glow mb-2">
          THE ULTIMATE CHAMPION
        </h3>
        <p className="text-white/80 font-beyblade">
          Will you be the one to claim victory?
        </p>
      </motion.div>
    </div>
  )
}

export default EventTimeline





