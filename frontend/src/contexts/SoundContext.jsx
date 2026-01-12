import React, { createContext, useContext, useState, useEffect } from 'react'
import useSoundHook from 'use-sound'

const SoundContext = createContext()

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('soundMuted')
    return saved ? JSON.parse(saved) : false
  })
  const [volume, setVolume] = useState(0.5)

  const [playSpin] = useSoundHook('/sounds/beyblade-spin.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })
  const [playClash] = useSoundHook('/sounds/beyblade-clash.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })
  const [playVictory] = useSoundHook('/sounds/victory.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })
  const [playDefeat] = useSoundHook('/sounds/defeat.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })
  const [playBurst] = useSoundHook('/sounds/burst.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })
  const [playEnergy] = useSoundHook('/sounds/energy-burst.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })
  const [playClick] = useSoundHook('/sounds/click.mp3', { 
    volume: isMuted ? 0 : volume * 0.3,
    interrupt: true 
  })
  const [playHover] = useSoundHook('/sounds/hover.mp3', { 
    volume: isMuted ? 0 : volume * 0.2,
    interrupt: true 
  })
  const [playNotification] = useSoundHook('/sounds/notification.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })
  const [playQuizStart] = useSoundHook('/sounds/quiz-start.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })
  const [playQuizEnd] = useSoundHook('/sounds/quiz-end.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  })

  useEffect(() => {
    const sounds = [playSpin, playClash, playVictory, playDefeat, playBurst, playEnergy, playClick, playHover, playNotification, playQuizStart, playQuizEnd]
    sounds.forEach(sound => {
      if (sound && sound.volume) {
        sound.volume = isMuted ? 0 : volume
      }
    })
  }, [volume, isMuted])

  useEffect(() => {
    localStorage.setItem('soundMuted', JSON.stringify(isMuted))
  }, [isMuted])

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const setVolumeLevel = (newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)))
  }

  const playSound = (soundType) => {
    if (isMuted) return

    switch (soundType) {
      case 'spin':
        playSpin()
        break
      case 'clash':
        playClash()
        break
      case 'victory':
        playVictory()
        break
      case 'defeat':
        playDefeat()
        break
      case 'burst':
        playBurst()
        break
      case 'energy':
        playEnergy()
        break
      case 'click':
        playClick()
        break
      case 'hover':
        playHover()
        break
      case 'notification':
        playNotification()
        break
      case 'quizStart':
        playQuizStart()
        break
      case 'quizEnd':
        playQuizEnd()
        break
      default:
        break
    }
  }

  const value = {
    isMuted,
    volume,
    toggleMute,
    setVolumeLevel,
    playSound
  }

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  )
}

export const useSound = () => {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
