import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Plus, Play, Pause, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useSound } from '../../contexts/SoundContext'

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [formData, setFormData] = useState({
    battleNumber: '',
    question: '',
    options: ['', ''],
    correctAnswer: 0,
    points: 3,
    timeLimit: 30,
    category: 'battle_prediction',
    difficulty: 'medium',
    description: ''
  })
  const { playSound } = useSound()

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
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

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({
      ...formData,
      options: newOptions
    })
  }

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      })
    }
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer: formData.correctAnswer >= newOptions.length ? newOptions.length - 1 : formData.correctAnswer
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    playSound('click')

    try {
      const url = editingQuiz 
        ? `/api/quizzes/${editingQuiz._id}`
        : '/api/quizzes'
      
      const method = editingQuiz ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchQuizzes()
        setShowForm(false)
        setEditingQuiz(null)
        setFormData({
          battleNumber: '',
          question: '',
          options: ['', ''],
          correctAnswer: 0,
          points: 3,
          timeLimit: 30,
          category: 'battle_prediction',
          difficulty: 'medium',
          description: ''
        })
        playSound('victory')
      }
    } catch (error) {
      console.error('Error saving quiz:', error)
      playSound('defeat')
    }
  }

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      battleNumber: quiz.battleNumber,
      question: quiz.question,
      options: quiz.options,
      correctAnswer: quiz.correctAnswer,
      points: quiz.points,
      timeLimit: quiz.timeLimit,
      category: quiz.category,
      difficulty: quiz.difficulty,
      description: quiz.description || ''
    })
    setShowForm(true)
    playSound('click')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return
    
    playSound('click')
    try {
      const response = await fetch(`/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchQuizzes()
        playSound('victory')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      playSound('defeat')
    }
  }

  const handleStartQuiz = async (quizId) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        fetchQuizzes()
        playSound('click')
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
    }
  }

  const handleEndQuiz = async (quizId) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        fetchQuizzes()
        playSound('click')
      }
    } catch (error) {
      console.error('Error ending quiz:', error)
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
          QUIZZES
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowForm(true)
            setEditingQuiz(null)
            setFormData({
              battleNumber: '',
              question: '',
              options: ['', ''],
              correctAnswer: 0,
              points: 3,
              timeLimit: 30,
              category: 'battle_prediction',
              difficulty: 'medium',
              description: ''
            })
            playSound('click')
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          NEW QUIZ
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
            className="card-glow p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-anime font-bold text-glow mb-6">
              {editingQuiz ? 'EDIT QUIZ' : 'CREATE QUIZ'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Question
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300 resize-none"
                  placeholder="Enter the quiz question"
                />
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Options
                </label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={index}
                        checked={formData.correctAnswer === index}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-neon-blue"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                        className="flex-1 px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                        placeholder={`Option ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-neon-red hover:bg-neon-red/20 rounded-lg transition-all duration-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="flex items-center space-x-2 px-4 py-2 text-neon-green hover:bg-neon-green/20 rounded-lg transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Time Limit (seconds)
                  </label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    min="10"
                    max="300"
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  >
                    <option value="battle_prediction">Battle Prediction</option>
                    <option value="beyblade_knowledge">Beyblade Knowledge</option>
                    <option value="strategy">Strategy</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                  placeholder="Brief description of the quiz"
                />
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex-1"
                >
                  {editingQuiz ? 'UPDATE' : 'CREATE'}
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
        {quizzes.map((quiz) => (
          <motion.div
            key={quiz._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glow p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <Brain className="w-5 h-5 text-neon-blue" />
                  <h3 className="text-lg font-anime font-bold text-white">
                    {quiz.battleNumber}
                  </h3>
                  <span className={`text-sm font-beyblade px-2 py-1 rounded-full ${
                    quiz.isActive ? 'bg-neon-green/20 text-neon-green' :
                    quiz.isCompleted ? 'bg-neon-blue/20 text-neon-blue' :
                    'bg-neon-yellow/20 text-neon-yellow'
                  }`}>
                    {quiz.isActive ? 'ACTIVE' : quiz.isCompleted ? 'COMPLETED' : 'INACTIVE'}
                  </span>
                </div>
                
                <p className="text-white/80 font-beyblade mb-3">
                  {quiz.question}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>Points: {quiz.points}</span>
                  <span>•</span>
                  <span>Time: {quiz.timeLimit}s</span>
                  <span>•</span>
                  <span>Responses: {quiz.totalResponses}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {quiz.isActive ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEndQuiz(quiz._id)}
                    className="p-2 rounded-lg text-neon-red hover:bg-neon-red/20 transition-all duration-300"
                  >
                    <Pause className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleStartQuiz(quiz._id)}
                    className="p-2 rounded-lg text-neon-green hover:bg-neon-green/20 transition-all duration-300"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(quiz)}
                  className="p-2 rounded-lg text-neon-blue hover:bg-neon-blue/20 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(quiz._id)}
                  className="p-2 rounded-lg text-neon-red hover:bg-neon-red/20 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {quizzes.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-neon-blue mx-auto mb-4 opacity-50" />
            <p className="text-white/60 font-beyblade text-lg">
              No quizzes yet. Create your first quiz!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminQuizzes
