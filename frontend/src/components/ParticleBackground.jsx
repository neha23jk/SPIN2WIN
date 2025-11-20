import React from 'react'
import { useParticles } from '../contexts/ParticleContext'

const ParticleBackground = () => {
  const { particles } = useParticles()

  return (
    <div className="particle-container fixed inset-0 pointer-events-none z-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`particle ${particle.type === 'burst' ? 'energy-burst' : particle.type === 'flare' ? 'lens-flare' : 'particle-float'}`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  )
}

export default ParticleBackground





