import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Plus, Play, Pause, Edit, Trash2, CheckCircle, XCircle, Trophy, Users, Clock, Target } from 'lucide-react'
import { useSound } from '../../contexts/SoundContext'

const AdminQuizSets = () => {
  const [quizSets, setQuizSets] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuizSet, setEditingQuizSet] = useState(null)
  const [showMatchResultForm, setShowMatchResultForm] = useState(false)
  const [selectedQuizSet, setSelectedQuizSet] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    battleNumber: '',
    matchId: '',
    totalQuestions: 5,
    questions: []
  })
  const [matchResultData, setMatchResultData] = useState({
    winner: '',
    loser: '',
    battleType: 'burst',
    battleDuration: 0
  })
  const { playSound } = useSound()

  useEffect(() => {
    fetchQuizSets()
    fetchMatches()
  }, [])

  const fetchQuizSets = async () => {
    try {
      const response = await fetch('/api/quiz-sets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setQuizSets(data.quizSets || [])
    } catch (error) {
      console.error('Error fetching quiz sets:', error)
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value
    }
    setFormData({
      ...formData,
      questions: newQuestions
    })
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setFormData({
      ...formData,
      questions: newQuestions
    })
  }

  const addQuestion = () => {
    if (formData.questions.length < formData.totalQuestions) {
      setFormData({
        ...formData,
        questions: [
          ...formData.questions,
          {
            question: '',
            options: ['', ''],
            correctAnswer: 0,
            points: 3,
            timeLimit: 30,
            category: 'battle_prediction',
            difficulty: 'medium'
          }
        ]
      })
    }
  }

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      questions: newQuestions
    })
  }

  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions]
    if (newQuestions[questionIndex].options.length < 6) {
      newQuestions[questionIndex].options.push('')
      setFormData({
        ...formData,
        questions: newQuestions
      })
    }
  }

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions]
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options.splice(optionIndex, 1)
      // Adjust correct answer if necessary
      if (newQuestions[questionIndex].correctAnswer >= newQuestions[questionIndex].options.length) {
        newQuestions[questionIndex].correctAnswer = newQuestions[questionIndex].options.length - 1
      }
      setFormData({
        ...formData,
        questions: newQuestions
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    playSound('click')

    if (formData.questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    try {
      const url = editingQuizSet 
        ? `/api/quiz-sets/${editingQuizSet._id}`
        : '/api/quiz-sets'
      
      const method = editingQuizSet ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchQuizSets()
        setShowForm(false)
        setEditingQuizSet(null)
        resetForm()
        playSound('victory')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Error saving quiz set')
        playSound('defeat')
      }
    } catch (error) {
      console.error('Error saving quiz set:', error)
      playSound('defeat')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      battleNumber: '',
      matchId: '',
      totalQuestions: 5,
      questions: []
    })
  }

  const handleEdit = (quizSet) => {
    setEditingQuizSet(quizSet)
    setFormData({
      name: quizSet.name,
      description: quizSet.description || '',
      battleNumber: quizSet.battleNumber,
      matchId: quizSet.matchId._id || quizSet.matchId,
      totalQuestions: quizSet.totalQuestions,
      questions: quizSet.questions
    })
    setShowForm(true)
    playSound('click')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz set?')) return
    
    playSound('click')
    try {
      const response = await fetch(`/api/quiz-sets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchQuizSets()
        playSound('victory')
      }
    } catch (error) {
      console.error('Error deleting quiz set:', error)
      playSound('defeat')
    }
  }

  const handleStartQuizSet = async (quizSetId) => {
    try {
      const response = await fetch(`/api/quiz-sets/${quizSetId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Quiz set started successfully:', data)
        fetchQuizSets()
        playSound('click')
      } else {
        const errorData = await response.json()
        console.error('Error starting quiz set:', errorData)
        alert(errorData.message || 'Error starting quiz set')
        playSound('defeat')
      }
    } catch (error) {
      console.error('Error starting quiz set:', error)
      alert('Network error. Please try again.')
      playSound('defeat')
    }
  }

  const handleEndQuizSet = async (quizSetId) => {
    try {
      const response = await fetch(`/api/quiz-sets/${quizSetId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Quiz set ended successfully:', data)
        fetchQuizSets()
        playSound('click')
      } else {
        const errorData = await response.json()
        console.error('Error ending quiz set:', errorData)
        alert(errorData.message || 'Error ending quiz set')
        playSound('defeat')
      }
    } catch (error) {
      console.error('Error ending quiz set:', error)
      alert('Network error. Please try again.')
      playSound('defeat')
    }
  }

  const handleSetMatchResult = async (quizSet) => {
    setSelectedQuizSet(quizSet)
    setMatchResultData({
      winner: quizSet.matchResult?.winner?._id || '',
      loser: quizSet.matchResult?.loser?._id || '',
      battleType: quizSet.matchResult?.battleType || 'burst',
      battleDuration: quizSet.matchResult?.battleDuration || 0
    })
    setShowMatchResultForm(true)
    playSound('click')
  }

  const handleMatchResultSubmit = async (e) => {
    e.preventDefault()
    playSound('click')

    try {
      const response = await fetch(`/api/quiz-sets/${selectedQuizSet._id}/match-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(matchResultData)
      })

      if (response.ok) {
        fetchQuizSets()
        setShowMatchResultForm(false)
        setSelectedQuizSet(null)
        playSound('victory')
      }
    } catch (error) {
      console.error('Error setting match result:', error)
      playSound('defeat')
    }
  }

  const getMatchName = (matchId) => {
    const match = matches.find(m => m._id === matchId || m._id === matchId._id)
    return match ? `${match.matchId} - ${match.player1?.name} vs ${match.player2?.name}` : 'Unknown Match'
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
          QUIZ SETS
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowForm(true)
            setEditingQuizSet(null)
            resetForm()
            playSound('click')
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          NEW QUIZ SET
        </motion.button>
      </div>

      {/* Quiz Set Form Modal */}
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
            className="card-glow p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-anime font-bold text-glow mb-6">
              {editingQuizSet ? 'EDIT QUIZ SET' : 'CREATE QUIZ SET'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                    Quiz Set Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                    placeholder="e.g., Elementary Round Quiz Set"
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
                  Match
                </label>
                <select
                  name="matchId"
                  value={formData.matchId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                >
                  <option value="">Select Match</option>
                  {matches.map(match => (
                    <option key={match._id} value={match._id}>
                      {match.matchId} - {match.player1?.name} vs {match.player2?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300 resize-none"
                  placeholder="Description of the quiz set"
                />
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Total Questions
                </label>
                <input
                  type="number"
                  name="totalQuestions"
                  value={formData.totalQuestions}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                />
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-anime font-bold text-glow">
                    Questions ({formData.questions.length}/{formData.totalQuestions})
                  </h4>
                  {formData.questions.length < formData.totalQuestions && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addQuestion}
                      className="btn-secondary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </motion.button>
                  )}
                </div>

                <div className="space-y-6">
                  {formData.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="card-glow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-md font-anime font-bold text-neon-blue">
                          Question {questionIndex + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="p-2 text-neon-red hover:bg-neon-red/20 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                            Question
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                            required
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300 resize-none"
                            placeholder="Enter the question"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                            Options
                          </label>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name={`correctAnswer_${questionIndex}`}
                                  value={optionIndex}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', parseInt(e.target.value))}
                                  className="w-4 h-4 text-neon-blue"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                  required
                                  className="flex-1 px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(questionIndex, optionIndex)}
                                    className="p-2 text-neon-red hover:bg-neon-red/20 rounded-lg transition-all duration-300"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {question.options.length < 6 && (
                              <button
                                type="button"
                                onClick={() => addOption(questionIndex)}
                                className="flex items-center space-x-2 px-4 py-2 text-neon-green hover:bg-neon-green/20 rounded-lg transition-all duration-300"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Option</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                              Points
                            </label>
                            <input
                              type="number"
                              value={question.points}
                              onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))}
                              min="1"
                              max="10"
                              className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                              Time Limit (s)
                            </label>
                            <input
                              type="number"
                              value={question.timeLimit}
                              onChange={(e) => handleQuestionChange(questionIndex, 'timeLimit', parseInt(e.target.value))}
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
                              value={question.category}
                              onChange={(e) => handleQuestionChange(questionIndex, 'category', e.target.value)}
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
                              value={question.difficulty}
                              onChange={(e) => handleQuestionChange(questionIndex, 'difficulty', e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex-1"
                >
                  {editingQuizSet ? 'UPDATE' : 'CREATE'}
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

      {/* Match Result Form Modal */}
      {showMatchResultForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowMatchResultForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="card-glow p-8 w-full max-w-2xl"
          >
            <h3 className="text-xl font-anime font-bold text-glow mb-6">
              SET MATCH RESULT
            </h3>

            <form onSubmit={handleMatchResultSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Winner
                </label>
                <select
                  name="winner"
                  value={matchResultData.winner}
                  onChange={(e) => setMatchResultData({...matchResultData, winner: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                >
                  <option value="">Select Winner</option>
                  {selectedQuizSet?.matchId?.player1 && (
                    <option value={selectedQuizSet.matchId.player1._id || selectedQuizSet.matchId.player1}>
                      {selectedQuizSet.matchId.player1.name}
                    </option>
                  )}
                  {selectedQuizSet?.matchId?.player2 && (
                    <option value={selectedQuizSet.matchId.player2._id || selectedQuizSet.matchId.player2}>
                      {selectedQuizSet.matchId.player2.name}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Battle Type
                </label>
                <select
                  name="battleType"
                  value={matchResultData.battleType}
                  onChange={(e) => setMatchResultData({...matchResultData, battleType: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                >
                  <option value="burst">Burst Finish</option>
                  <option value="spin">Spin Finish</option>
                  <option value="ring_out">Ring Out</option>
                  <option value="draw">Draw</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-beyblade font-semibold text-white/80 mb-2">
                  Battle Duration (seconds)
                </label>
                <input
                  type="number"
                  name="battleDuration"
                  value={matchResultData.battleDuration}
                  onChange={(e) => setMatchResultData({...matchResultData, battleDuration: parseInt(e.target.value)})}
                  min="0"
                  className="w-full px-4 py-3 rounded-lg bg-beyblade-purple/20 border border-neon-blue/30 text-white placeholder-white/50 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
                />
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex-1"
                >
                  SET RESULT
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMatchResultForm(false)}
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
        {quizSets.map((quizSet) => (
          <motion.div
            key={quizSet._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glow p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <Brain className="w-5 h-5 text-neon-blue" />
                  <h3 className="text-lg font-anime font-bold text-white">
                    {quizSet.name}
                  </h3>
                  <span className={`text-sm font-beyblade px-2 py-1 rounded-full ${
                    quizSet.isActive ? 'bg-neon-green/20 text-neon-green' :
                    quizSet.isCompleted ? 'bg-neon-blue/20 text-neon-blue' :
                    'bg-neon-yellow/20 text-neon-yellow'
                  }`}>
                    {quizSet.isActive ? 'ACTIVE' : quizSet.isCompleted ? 'COMPLETED' : 'INACTIVE'}
                  </span>
                </div>
                
                <p className="text-white/80 font-beyblade mb-3">
                  {quizSet.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/60">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>Match: {getMatchName(quizSet.matchId)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Questions: {quizSet.questions.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Responses: {quizSet.totalResponses}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Accuracy: {quizSet.accuracyPercentage}%</span>
                  </div>
                </div>

                {quizSet.matchResult?.isResultSet && (
                  <div className="mt-3 p-3 rounded-lg bg-neon-green/10 border border-neon-green/30">
                    <div className="flex items-center space-x-2 text-neon-green">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-beyblade">
                        Match Result Set: {quizSet.matchResult.winner?.name} won by {quizSet.matchResult.battleType}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {!quizSet.matchResult?.isResultSet && quizSet.isCompleted && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSetMatchResult(quizSet)}
                    className="p-2 rounded-lg text-neon-purple hover:bg-neon-purple/20 transition-all duration-300"
                    title="Set Match Result"
                  >
                    <Trophy className="w-4 h-4" />
                  </motion.button>
                )}
                
                {quizSet.isActive ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEndQuizSet(quizSet._id)}
                    className="p-2 rounded-lg text-neon-red hover:bg-neon-red/20 transition-all duration-300"
                  >
                    <Pause className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleStartQuizSet(quizSet._id)}
                    className="p-2 rounded-lg text-neon-green hover:bg-neon-green/20 transition-all duration-300"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(quizSet)}
                  className="p-2 rounded-lg text-neon-blue hover:bg-neon-blue/20 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(quizSet._id)}
                  className="p-2 rounded-lg text-neon-red hover:bg-neon-red/20 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {quizSets.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-neon-blue mx-auto mb-4 opacity-50" />
            <p className="text-white/60 font-beyblade text-lg">
              No quiz sets yet. Create your first quiz set!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminQuizSets
