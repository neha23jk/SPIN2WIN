import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Users, Trophy, Sword, Shield, Target, Crown, Search, Download, Filter } from 'lucide-react'
import { useSound } from '../../contexts/SoundContext'

const AdminBladers = () => {
  const [bladers, setBladers] = useState([])
  const [filteredBladers, setFilteredBladers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlader, setEditingBlader] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRound, setFilterRound] = useState('')
  const [formData, setFormData] = useState({
    arenaId: '',
    name: '',
    institute: '',
    beyCombo: '',
    battleNumber: '',
    round: 'elementary'
  })
  const { playSound } = useSound()

  useEffect(() => {
    fetchBladers()
  }, [])

  const fetchBladers = async () => {
    try {
      const response = await fetch('/api/bladers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setBladers(data.bladers || [])
      setFilteredBladers(data.bladers || [])
    } catch (error) {
      console.error('Error fetching bladers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = bladers

    if (searchTerm) {
      filtered = filtered.filter(blader =>
        blader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blader.institute.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blader.arenaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blader.beyCombo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterRound) {
      filtered = filtered.filter(blader => blader.round === filterRound)
    }

    setFilteredBladers(filtered)
  }, [bladers, searchTerm, filterRound])

  const handleExport = async (format = 'json') => {
    try {
      const response = await fetch(`/api/admin/export/bladers?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'bladers.csv'
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'bladers.json'
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
        playSound('victory')
      }
    } catch (error) {
      console.error('Error exporting bladers:', error)
      playSound('defeat')
    }
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
      const url = editingBlader 
        ? `/api/bladers/${editingBlader._id}`
        : '/api/bladers'
      
      const method = editingBlader ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchBladers()
        setShowForm(false)
        setEditingBlader(null)
        setFormData({ arenaId: '', name: '', institute: '', beyCombo: '', battleNumber: '', round: 'elementary' })
        playSound('victory')
      }
    } catch (error) {
      console.error('Error saving blader:', error)
      playSound('defeat')
    }
  }

  const handleEdit = (blader) => {
    setEditingBlader(blader)
    setFormData({
      arenaId: blader.arenaId,
      name: blader.name,
      institute: blader.institute,
      beyCombo: blader.beyCombo,
      battleNumber: blader.battleNumber,
      round: blader.round
    })
    setShowForm(true)
    playSound('click')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blader?')) return
    
    playSound('click')
    try {
      const response = await fetch(`/api/bladers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchBladers()
        playSound('victory')
      }
    } catch (error) {
      console.error('Error deleting blader:', error)
      playSound('defeat')
    }
  }

  const getRoundIcon = (round) => {
    switch (round) {
      case 'elementary': return <Sword className="w-4 h-4 text-neon-blue" />
      case 'quarter': return <Shield className="w-4 h-4 text-neon-red" />
      case 'semi': return <Target className="w-4 h-4 text-neon-yellow" />
      case 'final': return <Trophy className="w-4 h-4 text-neon-purple" />
      case 'champion': return <Crown className="w-4 h-4 text-neon-gold" />
      default: return <Sword className="w-4 h-4 text-neon-blue" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-anime font-bold text-glow">
          BLADERS ({filteredBladers.length})
        </h2>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport('csv')}
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport('json')}
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(true)
              setEditingBlader(null)
              setFormData({ arenaId: '', name: '', institute: '', beyCombo: '', battleNumber: '', round: 'elementary' })
              playSound('click')
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            ADD BLADER
          </motion.button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search bladers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
          >
            <option value="">All Rounds</option>
            <option value="elementary">Elementary</option>
            <option value="quarter">Quarter</option>
            <option value="semi">Semi</option>
            <option value="final">Final</option>
            <option value="champion">Champion</option>
          </select>
        </div>
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
            className="card-glow p-8 w-full max-w-2xl"
          >
            <h3 className="text-xl font-anime font-bold text-glow mb-6">
              {editingBlader ? 'EDIT BLADER' : 'ADD BLADER'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="e.g., E1, S2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  placeholder="Blader name"
                />
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Institute
                </label>
                <input
                  type="text"
                  name="institute"
                  value={formData.institute}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  placeholder="Institute/College name"
                />
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Bey Combo
                </label>
                <input
                  type="text"
                  name="beyCombo"
                  value={formData.beyCombo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  placeholder="Beyblade combination"
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
                  <option value="champion">Champion</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex-1"
                >
                  {editingBlader ? 'UPDATE' : 'CREATE'}
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

      {/* Bladers List */}
      <div className="space-y-4">
        {filteredBladers.map((blader) => (
          <motion.div
            key={blader._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glow p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRoundIcon(blader.round)}
                  <span className={`font-beyblade font-semibold ${getRoundColor(blader.round)}`}>
                    {blader.round.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-anime font-bold text-white">
                    {blader.name}
                  </h3>
                  <p className="text-white/80 font-beyblade">
                    {blader.arenaId} • {blader.institute}
                  </p>
                  <p className="text-sm text-neon-blue font-beyblade">
                    {blader.beyCombo}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right text-sm font-beyblade text-white/60">
                  <div>W: {blader.wins || 0}</div>
                  <div>L: {blader.losses || 0}</div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(blader)}
                  className="p-2 rounded-lg text-neon-blue hover:bg-neon-blue/20 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(blader._id)}
                  className="p-2 rounded-lg text-neon-red hover:bg-neon-red/20 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredBladers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neon-blue mx-auto mb-4 opacity-50" />
            <p className="text-white/60 font-beyblade text-lg">
              No bladers yet. Add your first blader!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBladers
