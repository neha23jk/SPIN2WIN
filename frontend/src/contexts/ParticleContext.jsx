import React, { createContext, useContext, useState, useEffect } from 'react'

const ParticleContext = createContext()

export const ParticleProvider = ({ children }) => {
  const [particles, setParticles] = useState([])
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const createParticle = () => {
      const particle = {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        color: ['#00f6ff', '#ff004d', '#faff00', '#8b5cf6'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.8 + 0.2,
        delay: Math.random() * 4
      }
      return particle
    }

    const addParticle = () => {
      if (particles.length < 50) {
        setParticles(prev => [...prev, createParticle()])
      }
    }

    const updateParticles = () => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            y: particle.y - particle.speed,
            opacity: particle.opacity - 0.01
          }))
          .filter(particle => particle.y > -10 && particle.opacity > 0)
      )
    }

    const interval = setInterval(addParticle, 200)
    const animation = setInterval(updateParticles, 50)

    return () => {
      clearInterval(interval)
      clearInterval(animation)
    }
  }, [isActive, particles.length])

  const addEnergyBurst = (x, y) => {
    const burst = {
      id: Math.random().toString(36).substr(2, 9),
      x: x - 50,
      y: y - 50,
      size: 100,
      opacity: 1,
      type: 'burst'
    }
    
    setParticles(prev => [...prev, burst])
    
    // Remove burst after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== burst.id))
    }, 600)
  }

  const addLensFlare = (x, y) => {
    const flare = {
      id: Math.random().toString(36).substr(2, 9),
      x: x - 100,
      y: y - 100,
      size: 200,
      opacity: 0.8,
      type: 'flare'
    }
    
    setParticles(prev => [...prev, flare])
    
    // Remove flare after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== flare.id))
    }, 3000)
  }

  const clearParticles = () => {
    setParticles([])
  }

  const toggleParticles = () => {
    setIsActive(!isActive)
    if (isActive) {
      clearParticles()
    }
  }

  const value = {
    particles,
    isActive,
    addEnergyBurst,
    addLensFlare,
    clearParticles,
    toggleParticles
  }

  return (
    <ParticleContext.Provider value={value}>
      {children}
    </ParticleContext.Provider>
  )
}

export const useParticles = () => {
  const context = useContext(ParticleContext)
  if (!context) {
    throw new Error('useParticles must be used within a ParticleProvider')
  }
  return context
}





