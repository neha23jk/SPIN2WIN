import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react'
import { useSound } from '../../contexts/SoundContext'

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium'
  })
  const { playSound } = useSound()

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
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
      const url = editingAnnouncement 
        ? `/api/announcements/${editingAnnouncement._id}`
        : '/api/announcements'
      
      const method = editingAnnouncement ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchAnnouncements()
        setShowForm(false)
        setEditingAnnouncement(null)
        setFormData({ title: '', message: '', priority: 'medium' })
        playSound('victory')
      }
    } catch (error) {
      console.error('Error saving announcement:', error)
      playSound('defeat')
    }
  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority
    })
    setShowForm(true)
    playSound('click')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    
    playSound('click')
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchAnnouncements()
        playSound('victory')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      playSound('defeat')
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchAnnouncements()
        playSound('click')
      }
    } catch (error) {
      console.error('Error toggling announcement:', error)
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-neon-red" />
      case 'high': return <XCircle className="w-4 h-4 text-neon-yellow" />
      case 'medium': return <Info className="w-4 h-4 text-neon-blue" />
      case 'low': return <CheckCircle className="w-4 h-4 text-neon-green" />
      default: return <Info className="w-4 h-4 text-neon-blue" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-neon-red/50 bg-gradient-to-r from-neon-red/20 to-neon-pink/20'
      case 'high': return 'border-neon-yellow/50 bg-gradient-to-r from-neon-yellow/20 to-neon-orange/20'
      case 'medium': return 'border-neon-blue/50 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20'
      case 'low': return 'border-neon-green/50 bg-gradient-to-r from-neon-green/20 to-neon-teal/20'
      default: return 'border-neon-blue/50 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20'
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
          ANNOUNCEMENTS
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowForm(true)
            setEditingAnnouncement(null)
            setFormData({ title: '', message: '', priority: 'medium' })
            playSound('click')
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          NEW ANNOUNCEMENT
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
            className="card-glow p-8 w-full max-w-2xl"
          >
            <h3 className="text-xl font-anime font-bold text-glow mb-6">
              {editingAnnouncement ? 'EDIT ANNOUNCEMENT' : 'CREATE ANNOUNCEMENT'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300 resize-none"
                  placeholder="Enter announcement message"
                />
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex-1"
                >
                  {editingAnnouncement ? 'UPDATE' : 'CREATE'}
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

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <motion.div
            key={announcement._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card-glow p-6 border ${getPriorityColor(announcement.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {getPriorityIcon(announcement.priority)}
                  <h3 className="text-lg font-anime font-bold text-white">
                    {announcement.title}
                  </h3>
                  <span className={`text-xs font-beyblade px-2 py-1 rounded-full ${
                    announcement.isActive ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'
                  }`}>
                    {announcement.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                
                <p className="text-white/80 font-beyblade mb-3">
                  {announcement.message}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>By: {announcement.author?.name || 'Admin'}</span>
                  <span>•</span>
                  <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleActive(announcement._id, announcement.isActive)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    announcement.isActive 
                      ? 'text-neon-green hover:bg-neon-green/20' 
                      : 'text-neon-red hover:bg-neon-red/20'
                  }`}
                >
                  {announcement.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(announcement)}
                  className="p-2 rounded-lg text-neon-blue hover:bg-neon-blue/20 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(announcement._id)}
                  className="p-2 rounded-lg text-neon-red hover:bg-neon-red/20 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-neon-blue mx-auto mb-4 opacity-50" />
            <p className="text-white/60 font-beyblade text-lg">
              No announcements yet. Create your first one!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAnnouncements
