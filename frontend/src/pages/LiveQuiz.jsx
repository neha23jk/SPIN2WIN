import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Clock, Trophy, Users, Zap, CheckCircle, XCircle, Play, Pause, RotateCcw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../contexts/SoundContext'
import QuizSetCard from '../components/QuizSetCard'
import Leaderboard from '../components/Leaderboard'
import CountdownTimer from '../components/CountdownTimer'

const LiveQuiz = () => {
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { playSound } = useSound()

  useEffect(() => {
    fetchActiveQuiz()
    fetchLeaderboard()
    if (isAuthenticated) {
      fetchUserStats()
    }
  }, [isAuthenticated])

  const fetchActiveQuiz = async () => {
    try {
      const response = await fetch('/api/quiz-sets/active')
      const data = await response.json()
      setActiveQuiz(data.quizSet)
      if (data.quizSet) {
        
        setTimeRemaining(data.quizSet.questions[0]?.timeLimit || 30)
      }
    } catch (error) {
      console.error('Error fetching active quiz set:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/responses/leaderboard?limit=10')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const fetchUserStats = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/responses/stats/${user.id}`)
      const data = await response.json()
      setUserStats(data.stats)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleAnswerSelect = (answerIndex) => {
    if (!activeQuiz || selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    playSound('click')
  }

  const handleSubmitAnswer = async () => {
    if (!activeQuiz || selectedAnswer === null || !isAuthenticated) return

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quizId: activeQuiz._id,
          answer: selectedAnswer,
          responseTime: activeQuiz.timeLimit - timeRemaining,
          timeRemaining: timeRemaining
        })
      })

      const data = await response.json()
      
      if (data.response.isCorrect) {
        playSound('victory')
      } else {
        playSound('defeat')
      }

      setShowResults(true)
      fetchLeaderboard()
      fetchUserStats()
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const handleNextQuiz = () => {
    setActiveQuiz(null)
    setSelectedAnswer(null)
    setShowResults(false)
    setQuizStarted(false)
    setTimeRemaining(0)
    fetchActiveQuiz()
  }

  const startQuiz = () => {
    setQuizStarted(true)
    playSound('quizStart')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-16 h-16 text-neon-blue" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-beyblade-dark via-beyblade-purple/10 to-beyblade-dark">
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-16 px-4 text-center"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <Brain className="w-20 h-20 text-neon-blue mx-auto mb-6" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-anime font-black text-glow mb-6">
            LIVE QUIZ
          </h1>
          
          <p className="text-xl md:text-2xl font-beyblade text-white/90 mb-8 max-w-4xl mx-auto">
            Test your Beyblade knowledge and strategy in real-time battles of the mind
          </p>

          {/* Quiz Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 backdrop-blur-sm rounded-lg p-4 border border-neon-blue/30">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${activeQuiz ? 'bg-neon-green animate-pulse' : 'bg-neon-red'}`} />
                  <span className="text-sm font-beyblade text-white">
                    {activeQuiz ? 'QUIZ ACTIVE' : 'NO ACTIVE QUIZ'}
                  </span>
                </div>
                {activeQuiz && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-neon-yellow" />
                    <span className="text-sm font-beyblade text-neon-yellow">
                      {timeRemaining}s remaining
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Section */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            {activeQuiz ? (
              <QuizSetCard
                quizSet={activeQuiz}
                selectedAnswer={selectedAnswer}
                timeRemaining={timeRemaining}
                quizStarted={quizStarted}
                showResults={showResults}
                onAnswerSelect={handleAnswerSelect}
                onSubmitAnswer={handleSubmitAnswer}
                onNextQuiz={handleNextQuiz}
                onStartQuiz={startQuiz}
                isAuthenticated={isAuthenticated}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-glow p-12 text-center"
              >
                <Brain className="w-16 h-16 text-neon-blue mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-anime font-bold text-white mb-4">
                  NO ACTIVE QUIZ
                </h3>
                <p className="text-white/80 font-beyblade mb-6">
                  Check back soon for the next quiz challenge!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchActiveQuiz}
                  className="btn-primary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  REFRESH
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            {/* User Stats */}
            {isAuthenticated && userStats && (
              <motion.div
                variants={itemVariants}
                className="card-glow p-6"
              >
                <h3 className="text-xl font-anime font-bold text-neon-blue mb-4">
                  YOUR STATS
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-beyblade text-white/80">
                      Total Score
                    </span>
                    <span className="text-lg font-anime font-bold text-neon-yellow">
                      {userStats.totalScore || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-beyblade text-white/80">
                      Correct Answers
                    </span>
                    <span className="text-lg font-anime font-bold text-neon-green">
                      {userStats.correctResponses || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-beyblade text-white/80">
                      Total Responses
                    </span>
                    <span className="text-lg font-anime font-bold text-white">
                      {userStats.totalResponses || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-beyblade text-white/80">
                      Accuracy
                    </span>
                    <span className="text-lg font-anime font-bold text-neon-purple">
                      {userStats.totalResponses > 0 
                        ? Math.round((userStats.correctResponses / userStats.totalResponses) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leaderboard */}
            <motion.div
              variants={itemVariants}
              className="card-glow p-6"
            >
              <h3 className="text-xl font-anime font-bold text-neon-purple mb-4">
                LEADERBOARD
              </h3>
              <Leaderboard leaderboard={leaderboard} />
            </motion.div>

            {/* Quiz Rules */}
            <motion.div
              variants={itemVariants}
              className="card-glow p-6"
            >
              <h3 className="text-xl font-anime font-bold text-neon-yellow mb-4">
                QUIZ RULES
              </h3>
              <div className="space-y-2 text-sm font-beyblade text-white/80">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  <span>+3 points for correct answer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-neon-red" />
                  <span>-1 point for wrong answer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-neon-blue" />
                  <span>Limited time per question</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-neon-purple" />
                  <span>One attempt per question</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default LiveQuiz





