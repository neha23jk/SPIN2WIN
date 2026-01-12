import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Clock, Trophy, Users, Zap, CheckCircle, XCircle, Play, Pause, RotateCcw, Target, Award } from 'lucide-react'
import { useSound } from '../contexts/SoundContext'

const QuizSetCard = ({ 
  quizSet, 
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const { playSound } = useSound()

  const currentQuestion = quizSet?.questions[currentQuestionIndex]

  useEffect(() => {
    if (quizStarted && currentQuestion && timeRemaining > 0) {
      const timer = setTimeout(() => {
        if (timeRemaining > 0) {
         
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining, quizStarted, currentQuestion])

  const handleAnswerSelect = (answerIndex) => {
    if (!currentQuestion || selectedAnswer !== null) return
    
    onAnswerSelect(answerIndex)
    playSound('click')
  }

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || selectedAnswer === null || !isAuthenticated) return

    const newAnswer = {
      questionIndex: currentQuestionIndex,
      answer: selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      points: selectedAnswer === currentQuestion.correctAnswer ? currentQuestion.points : 0
    }

    const updatedAnswers = [...userAnswers, newAnswer]
    setUserAnswers(updatedAnswers)
    
    const newTotalScore = updatedAnswers.reduce((total, answer) => total + answer.points, 0)
    setTotalScore(newTotalScore)

    await onSubmitAnswer()

    if (currentQuestionIndex < quizSet.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        onAnswerSelect(null) 
        if (quizSet.questions[currentQuestionIndex + 1]) {
          
        }
      }, 2000) 
    } else {
      
      setQuizCompleted(true)
      playSound('victory')
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizSet.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      onAnswerSelect(null)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setTotalScore(0)
    setQuizCompleted(false)
    onAnswerSelect(null)
    onStartQuiz()
  }

  if (!quizSet) {
    return (
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
          onClick={onNextQuiz}
          className="btn-primary"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          REFRESH
        </motion.button>
      </motion.div>
    )
  }

  if (quizCompleted) {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length
    const accuracy = Math.round((correctAnswers / userAnswers.length) * 100)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glow p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <Trophy className="w-20 h-20 text-neon-gold mx-auto mb-4" />
        </motion.div>

        <h2 className="text-3xl font-anime font-bold text-glow mb-4">
          QUIZ COMPLETED!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Award className="w-6 h-6 text-neon-yellow" />
              <span className="text-lg font-anime font-bold text-neon-yellow">
                {totalScore}
              </span>
            </div>
            <p className="text-sm font-beyblade text-white/80">Total Score</p>
          </div>

          <div className="bg-gradient-to-br from-neon-green/20 to-neon-teal/20 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-6 h-6 text-neon-green" />
              <span className="text-lg font-anime font-bold text-neon-green">
                {correctAnswers}/{userAnswers.length}
              </span>
            </div>
            <p className="text-sm font-beyblade text-white/80">Correct Answers</p>
          </div>

          <div className="bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-6 h-6 text-neon-purple" />
              <span className="text-lg font-anime font-bold text-neon-purple">
                {accuracy}%
              </span>
            </div>
            <p className="text-sm font-beyblade text-white/80">Accuracy</p>
          </div>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRestartQuiz}
            className="btn-primary mr-4"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            RESTART QUIZ
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextQuiz}
            className="btn-secondary"
          >
            <Play className="w-4 h-4 mr-2" />
            NEW QUIZ
          </motion.button>
        </div>
      </motion.div>
    )
  }

  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glow p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <Brain className="w-20 h-20 text-neon-blue mx-auto mb-4" />
        </motion.div>

        <h2 className="text-3xl font-anime font-bold text-glow mb-4">
          {quizSet.name}
        </h2>

        <p className="text-white/80 font-beyblade mb-6">
          {quizSet.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-6 h-6 text-neon-blue" />
              <span className="text-lg font-anime font-bold text-neon-blue">
                {quizSet.questions.length}
              </span>
            </div>
            <p className="text-sm font-beyblade text-white/80">Questions</p>
          </div>

          <div className="bg-gradient-to-br from-neon-green/20 to-neon-teal/20 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Award className="w-6 h-6 text-neon-green" />
              <span className="text-lg font-anime font-bold text-neon-green">
                {quizSet.questions.reduce((total, q) => total + q.points, 0)}
              </span>
            </div>
            <p className="text-sm font-beyblade text-white/80">Total Points</p>
          </div>

          <div className="bg-gradient-to-br from-neon-yellow/20 to-neon-orange/20 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-6 h-6 text-neon-yellow" />
              <span className="text-lg font-anime font-bold text-neon-yellow">
                {currentQuestion?.timeLimit || 30}s
              </span>
            </div>
            <p className="text-sm font-beyblade text-white/80">Per Question</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="bg-gradient-to-r from-neon-red/20 to-neon-pink/20 p-4 rounded-lg mb-6">
            <p className="text-neon-red font-beyblade">
              Please log in to participate in the quiz
            </p>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartQuiz}
            className="btn-primary"
          >
            <Play className="w-4 h-4 mr-2" />
            START QUIZ
          </motion.button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow p-8"
    >
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-anime font-bold text-glow mb-2">
            {quizSet.name}
          </h2>
          <p className="text-white/80 font-beyblade">
            Question {currentQuestionIndex + 1} of {quizSet.questions.length}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-neon-yellow" />
            <span className="text-lg font-anime font-bold text-neon-yellow">
              {timeRemaining}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-neon-green" />
            <span className="text-lg font-anime font-bold text-neon-green">
              {totalScore}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-beyblade text-white/60 mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentQuestionIndex + 1) / quizSet.questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-beyblade-purple/20 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / quizSet.questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-anime font-bold text-white mb-6">
          {currentQuestion?.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                selectedAnswer === index
                  ? 'bg-neon-blue/30 border-2 border-neon-blue text-neon-blue'
                  : 'bg-beyblade-purple/20 border border-neon-blue/30 text-white hover:bg-neon-blue/10 hover:border-neon-blue/50'
              } ${selectedAnswer !== null ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index
                    ? 'border-neon-blue bg-neon-blue'
                    : 'border-white/30'
                }`}>
                  {selectedAnswer === index && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="font-beyblade">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
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
            onClick={handleSubmitAnswer}
            className="btn-primary"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            SUBMIT ANSWER
          </motion.button>
        </motion.div>
      )}

      {/* Results Display */}
      {showResults && selectedAnswer !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <>
                <CheckCircle className="w-6 h-6 text-neon-green" />
                <span className="text-lg font-anime font-bold text-neon-green">
                  CORRECT!
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-neon-red" />
                <span className="text-lg font-anime font-bold text-neon-red">
                  INCORRECT
                </span>
              </>
            )}
          </div>
          <p className="text-center text-white/80 font-beyblade">
            {selectedAnswer === currentQuestion.correctAnswer
              ? `+${currentQuestion.points} points`
              : 'Better luck next time!'}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default QuizSetCard
