import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, CheckCircle, XCircle, Clock, Zap, Trophy, RotateCcw } from 'lucide-react'
import { useSound } from '../contexts/SoundContext'
import CountdownTimer from './CountdownTimer'

const QuizCard = ({ 
  quiz, 
  selectedAnswer, 
  timeRemaining, 
  quizStarted, 
  showResults, 
  onAnswerSelect, 
  onSubmitAnswer, 
  onNextQuiz, 
  onStartQuiz,
  isAuthenticated 
}) => {
  const [localTimeRemaining, setLocalTimeRemaining] = useState(timeRemaining)
  const { playSound } = useSound()

  useEffect(() => {
    setLocalTimeRemaining(timeRemaining)
  }, [timeRemaining])

  useEffect(() => {
    if (!quizStarted || localTimeRemaining <= 0) return

    const timer = setInterval(() => {
      setLocalTimeRemaining(prev => {
        if (prev <= 1) {
          playSound('quizEnd')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, localTimeRemaining, playSound])

  const handleAnswerClick = (answerIndex) => {
    if (!quizStarted || selectedAnswer !== null || showResults) return
    onAnswerSelect(answerIndex)
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    onSubmitAnswer()
  }

  const getAnswerColor = (answerIndex) => {
    if (!showResults) {
      return selectedAnswer === answerIndex 
        ? 'border-neon-blue bg-neon-blue/20 text-neon-blue' 
        : 'border-white/30 hover:border-neon-blue/50 hover:bg-neon-blue/10'
    }

    if (answerIndex === quiz.correctAnswer) {
      return 'border-neon-green bg-neon-green/20 text-neon-green'
    } else if (answerIndex === selectedAnswer) {
      return 'border-neon-red bg-neon-red/20 text-neon-red'
    } else {
      return 'border-white/20 bg-white/5 text-white/50'
    }
  }

  const getAnswerIcon = (answerIndex) => {
    if (!showResults) return null

    if (answerIndex === quiz.correctAnswer) {
      return <CheckCircle className="w-5 h-5 text-neon-green" />
    } else if (answerIndex === selectedAnswer) {
      return <XCircle className="w-5 h-5 text-neon-red" />
    }
    return null
  }

  const isCorrect = selectedAnswer === quiz.correctAnswer

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-glow p-8"
    >
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-neon-blue" />
            <span className="text-lg font-beyblade font-bold text-neon-blue">
              BATTLE QUIZ
            </span>
          </div>
          <div className="text-sm font-beyblade text-white/80 bg-black/20 px-3 py-1 rounded-full">
            {quiz.battleNumber}
          </div>
        </div>

        {quizStarted && !showResults && (
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-neon-yellow" />
            <CountdownTimer 
              timeRemaining={localTimeRemaining}
              onTimeUp={() => {
                playSound('quizEnd')
                if (selectedAnswer !== null) {
                  handleSubmit()
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Quiz Content */}
      <AnimatePresence mode="wait">
        {!quizStarted ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-neon-gold mx-auto mb-6" />
            <h2 className="text-3xl font-anime font-bold text-glow mb-4">
              QUIZ READY
            </h2>
            <p className="text-white/80 font-beyblade mb-8">
              {isAuthenticated 
                ? "Click start to begin the quiz challenge!"
                : "Please login to participate in the quiz."
              }
            </p>
            
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartQuiz}
                className="btn-primary text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                START QUIZ
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/login'}
                className="btn-secondary text-lg px-8 py-4"
              >
                LOGIN TO PARTICIPATE
              </motion.button>
            )}
          </motion.div>
        ) : !showResults ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Question */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-anime font-bold text-white mb-4">
                {quiz.question}
              </h3>
              <div className="flex items-center justify-center space-x-4 text-sm font-beyblade text-white/80">
                <span>Points: {quiz.points}</span>
                <span>•</span>
                <span>Time: {quiz.timeLimit}s</span>
                <span>•</span>
                <span>Category: {quiz.category?.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {quiz.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerClick(index)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${getAnswerColor(index)}`}
                  disabled={selectedAnswer !== null}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-beyblade font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-beyblade text-lg">{option}</span>
                    {getAnswerIcon(index)}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Submit Button */}
            {selectedAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="btn-primary text-lg px-8 py-4"
                >
                  SUBMIT ANSWER
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mb-6"
            >
              {isCorrect ? (
                <CheckCircle className="w-20 h-20 text-neon-green mx-auto" />
              ) : (
                <XCircle className="w-20 h-20 text-neon-red mx-auto" />
              )}
            </motion.div>

            {/* Result Text */}
            <h2 className={`text-4xl font-anime font-bold mb-4 ${isCorrect ? 'text-neon-green' : 'text-neon-red'}`}>
              {isCorrect ? 'CORRECT!' : 'INCORRECT'}
            </h2>
            
            <p className="text-white/80 font-beyblade mb-6">
              {isCorrect 
                ? `You earned ${quiz.points} points!`
                : `The correct answer was: ${quiz.options[quiz.correctAnswer]}`
              }
            </p>

            {/* Correct Answer Display */}
            <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border border-neon-green/30">
              <p className="text-sm font-beyblade text-white/80 mb-2">Correct Answer:</p>
              <p className="text-lg font-beyblade font-bold text-neon-green">
                {String.fromCharCode(65 + quiz.correctAnswer)}. {quiz.options[quiz.correctAnswer]}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNextQuiz}
                className="btn-primary"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                NEXT QUIZ
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/battle-updates'}
                className="btn-secondary"
              >
                VIEW BRACKET
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default QuizCard





