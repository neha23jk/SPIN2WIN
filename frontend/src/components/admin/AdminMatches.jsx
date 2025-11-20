import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Clock, Play, Pause, CheckCircle, Plus, Edit, Trash2 } from 'lucide-react'
import { useSound } from '../../contexts/SoundContext'

const AdminMatches = () => {
  const [matches, setMatches] = useState([])
  const [bladers, setBladers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [formData, setFormData] = useState({
    matchId: '',
    round: 'elementary',
    player1: '',
    player2: '',
    arenaId: '',
    battleNumber: '',
    scheduledAt: '',
    notes: ''
  })
  const { playSound } = useSound()

  useEffect(() => {
    fetchMatches()
    fetchBladers()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBladers = async () => {
    try {
      const response = await fetch('/api/bladers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setBladers(data.bladers || [])
    } catch (error) {
      console.error('Error fetching bladers:', error)
    }
  }

  const getBladerName = (blader) => {
    // If blader is already populated (has name property)
    if (blader && typeof blader === 'object' && blader.name) {
      return blader.name
    }
    // If blader is just an ID, find it in the bladers array
    if (blader && typeof blader === 'string') {
      const foundBlader = bladers.find(b => b._id === blader)
      return foundBlader ? foundBlader.name : 'Unknown'
    }
    return 'Unknown'
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    playSound('click')

    try {
      const url = editingMatch 
        ? `/api/matches/${editingMatch._id}`
        : '/api/matches'
      
      const method = editingMatch ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchMatches()
        setShowForm(false)
        setEditingMatch(null)
        setFormData({
          matchId: '',
          round: 'elementary',
          player1: '',
          player2: '',
          arenaId: '',
          battleNumber: '',
          scheduledAt: '',
          notes: ''
        })
        playSound('victory')
      }
    } catch (error) {
      console.error('Error saving match:', error)
      playSound('defeat')
    }
  }

  const handleEdit = (match) => {
    setEditingMatch(match)
    const scheduledDate = new Date(match.scheduledAt)
    const formattedDate = scheduledDate.toISOString().slice(0, 16)
    
    setFormData({
      matchId: match.matchId,
      round: match.round,
      player1: match.player1._id || match.player1,
      player2: match.player2._id || match.player2,
      arenaId: match.arenaId,
      battleNumber: match.battleNumber,
      scheduledAt: formattedDate,
      notes: match.notes || ''
    })
    setShowForm(true)
    playSound('click')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return
    
    playSound('click')
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchMatches()
        playSound('victory')
      }
    } catch (error) {
      console.error('Error deleting match:', error)
      playSound('defeat')
    }
  }

  const handleUpdateMatchStatus = async (matchId, status) => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchMatches()
        playSound('click')
      }
    } catch (error) {
      console.error('Error updating match status:', error)
    }
  }

  const handleSetMatchResult = async (match) => {
    const winner = prompt(`Enter winner for ${match.matchId}:\n1. ${getBladerName(match.player1)}\n2. ${getBladerName(match.player2)}\n\nEnter 1 or 2:`)
    
    if (!winner || (winner !== '1' && winner !== '2')) {
      return
    }

    const battleType = prompt('Enter battle type:\n1. burst\n2. spin\n3. ring_out\n4. draw\n\nEnter 1, 2, 3, or 4:')
    const battleTypes = ['burst', 'spin', 'ring_out', 'draw']
    
    if (!battleType || !battleTypes[parseInt(battleType) - 1]) {
      return
    }

    const battleDuration = prompt('Enter battle duration in seconds (optional):') || 0

    try {
      const winnerId = winner === '1' ? match.player1._id || match.player1 : match.player2._id || match.player2
      
      const response = await fetch(`/api/matches/${match._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'completed',
          winner: winnerId,
          battleType: battleTypes[parseInt(battleType) - 1],
          battleDuration: parseInt(battleDuration)
        })
      })

      if (response.ok) {
        fetchMatches()
        playSound('victory')
        alert('Match result updated successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Error updating match result')
        playSound('defeat')
      }
    } catch (error) {
      console.error('Error updating match result:', error)
      playSound('defeat')
    }
  }

  const getRoundColor = (round) => {
    switch (round) {
      case 'elementary': return 'text-neon-blue'
      case 'quarter': return 'text-neon-red'
      case 'semi': return 'text-neon-yellow'
      case 'final': return 'text-neon-purple'
      case 'championship': return 'text-neon-gold'
      default: return 'text-neon-blue'
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
          MATCHES
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowForm(true)
            setEditingMatch(null)
            // Set default date to 1 hour from now
            const defaultDate = new Date()
            defaultDate.setHours(defaultDate.getHours() + 1)
            const formattedDefaultDate = defaultDate.toISOString().slice(0, 16)
            
            setFormData({
              matchId: '',
              round: 'elementary',
              player1: '',
              player2: '',
              arenaId: '',
              battleNumber: '',
              scheduledAt: formattedDefaultDate,
              notes: ''
            })
            playSound('click')
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          ADD MATCH
        </motion.button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="card-glow p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-anime font-bold text-glow mb-6">
              {editingMatch ? 'EDIT MATCH' : 'CREATE MATCH'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Match ID
                  </label>
                  <input
                    type="text"
                    name="matchId"
                    value={formData.matchId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                    placeholder="e.g., MATCH001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Round
                  </label>
                  <select
                    name="round"
                    value={formData.round}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  >
                    <option value="elementary">Elementary</option>
                    <option value="quarter">Quarter</option>
                    <option value="semi">Semi</option>
                    <option value="final">Final</option>
                    <option value="championship">Championship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Player 1
                  </label>
                  <select
                    name="player1"
                    value={formData.player1}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  >
                    <option value="">Select Player 1</option>
                    {bladers.map(blader => (
                      <option key={blader._id} value={blader._id}>
                        {blader.name} ({blader.arenaId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Player 2
                  </label>
                  <select
                    name="player2"
                    value={formData.player2}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  >
                    <option value="">Select Player 2</option>
                    {bladers.map(blader => (
                      <option key={blader._id} value={blader._id}>
                        {blader.name} ({blader.arenaId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Arena ID
                  </label>
                  <input
                    type="text"
                    name="arenaId"
                    value={formData.arenaId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                    placeholder="e.g., A1, B2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Battle Number
                  </label>
                  <input
                    type="text"
                    name="battleNumber"
                    value={formData.battleNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                    placeholder="e.g., E1, S2, Q3, F1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Scheduled Time
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300 resize-none"
                  placeholder="Additional notes about the match"
                />
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex-1"
                >
                  {editingMatch ? 'UPDATE' : 'CREATE'}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  CANCEL
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <div className="space-y-4">
        {matches.map((match) => (
          <motion.div
            key={match._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glow p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <Trophy className="w-5 h-5 text-neon-yellow" />
                  <h3 className="text-lg font-anime font-bold text-white">
                    {match.matchId}
                  </h3>
                  <span className={`text-sm font-beyblade px-2 py-1 rounded-full bg-black/20 ${getRoundColor(match.round)}`}>
                    {match.round.toUpperCase()}
                  </span>
                  <span className={`text-sm font-beyblade px-2 py-1 rounded-full ${
                    match.status === 'completed' ? 'bg-neon-green/20 text-neon-green' :
                    match.status === 'in_progress' ? 'bg-neon-yellow/20 text-neon-yellow' :
                    'bg-neon-blue/20 text-neon-blue'
                  }`}>
                    {match.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/80 font-beyblade">
                      <span className="text-neon-blue">{getBladerName(match.player1)}</span>
                      <span className="mx-2">vs</span>
                      <span className="text-neon-red">{getBladerName(match.player2)}</span>
                    </p>
                    <p className="text-sm text-white/60 font-beyblade">
                      Arena: {match.arenaId} • Battle: {match.battleNumber}
                    </p>
                  </div>
                  
                  {match.winner && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      <span className="text-sm font-beyblade text-neon-green">
                        Winner: {getBladerName(match.winner)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                {match.status === 'scheduled' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleUpdateMatchStatus(match._id, 'in_progress')}
                    className="p-2 rounded-lg text-neon-green hover:bg-neon-green/20 transition-all duration-300"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                )}
                
                {match.status === 'in_progress' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSetMatchResult(match)}
                    className="p-2 rounded-lg text-neon-blue hover:bg-neon-blue/20 transition-all duration-300"
                    title="Set Match Result"
                  >
                    <Trophy className="w-4 h-4" />
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(match)}
                  className="p-2 rounded-lg text-neon-yellow hover:bg-neon-yellow/20 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(match._id)}
                  className="p-2 rounded-lg text-neon-red hover:bg-neon-red/20 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-neon-blue mx-auto mb-4 opacity-50" />
            <p className="text-white/60 font-beyblade text-lg">
              No matches yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMatches
