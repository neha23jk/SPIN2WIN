const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Response = require('../models/Response');
const User = require('../models/User');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();


router.get('/', optionalAuth, async (req, res) => {
  try {
    const { isActive, isCompleted, category, difficulty, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isCompleted !== undefined) query.isCompleted = isCompleted === 'true';
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      message: 'Server error while fetching quizzes'
    });
  }
});


router.get('/active', optionalAuth, async (req, res) => {
  try {
    const activeQuiz = await Quiz.findOne({ isActive: true, isCompleted: false })
      .sort({ createdAt: -1 });

    if (!activeQuiz) {
      return res.json({ quiz: null });
    }

    
    const quizData = activeQuiz.toObject();
    if (!req.user || req.user.role !== 'admin') {
      delete quizData.correctAnswer;
    }

    res.json({ quiz: quizData });
  } catch (error) {
    console.error('Get active quiz error:', error);
    res.status(500).json({
      message: 'Server error while fetching active quiz'
    });
  }
});


router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

  
    const quizData = quiz.toObject();
    if (!req.user || req.user.role !== 'admin') {
      delete quizData.correctAnswer;
    }

    res.json({ quiz: quizData });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      message: 'Server error while fetching quiz'
    });
  }
});


router.post('/', authenticateToken, requireAdmin, [
  body('battleNumber')
    .trim()
    .matches(/^[ESQF]\d+$/)
    .withMessage('Battle Number must be in format E1, S2, Q3, F1'),
  body('question')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Question must be between 10 and 500 characters'),
  body('options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Options must be an array with 2-6 items'),
  body('correctAnswer')
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a non-negative integer'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Points must be between 1 and 10'),
  body('timeLimit')
    .optional()
    .isInt({ min: 10, max: 300 })
    .withMessage('Time limit must be between 10 and 300 seconds')
], async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      battleNumber, 
      question, 
      options, 
      correctAnswer, 
      points = 3, 
      timeLimit = 30,
      category = 'battle_prediction',
      difficulty = 'medium',
      description
    } = req.body;

    
    if (correctAnswer >= options.length) {
      return res.status(400).json({
        message: 'Correct answer index is out of range'
      });
    }

    const quiz = new Quiz({
      battleNumber,
      question,
      options,
      correctAnswer,
      points,
      timeLimit,
      category,
      difficulty,
      description
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      message: 'Server error while creating quiz'
    });
  }
});


router.put('/:id', authenticateToken, requireAdmin, [
  body('question')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Question must be between 10 and 500 characters'),
  body('options')
    .optional()
    .isArray({ min: 2, max: 6 })
    .withMessage('Options must be an array with 2-6 items'),
  body('correctAnswer')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a non-negative integer'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Points must be between 1 and 10'),
  body('timeLimit')
    .optional()
    .isInt({ min: 10, max: 300 })
    .withMessage('Time limit must be between 10 and 300 seconds')
], async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      question, 
      options, 
      correctAnswer, 
      points, 
      timeLimit,
      category,
      difficulty,
      description
    } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

   
    if (options && correctAnswer >= options.length) {
      return res.status(400).json({
        message: 'Correct answer index is out of range'
      });
    }

    const updateData = {};
    if (question) updateData.question = question;
    if (options) updateData.options = options;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (points) updateData.points = points;
    if (timeLimit) updateData.timeLimit = timeLimit;
    if (category) updateData.category = category;
    if (difficulty) updateData.difficulty = difficulty;
    if (description) updateData.description = description;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      message: 'Server error while updating quiz'
    });
  }
});


router.post('/:id/start', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    if (quiz.isActive) {
      return res.status(400).json({
        message: 'Quiz is already active'
      });
    }

    if (quiz.isCompleted) {
      return res.status(400).json({
        message: 'Quiz is already completed'
      });
    }

    await quiz.startQuiz();

    res.json({
      message: 'Quiz started successfully',
      quiz
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({
      message: 'Server error while starting quiz'
    });
  }
});


router.post('/:id/end', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    if (!quiz.isActive) {
      return res.status(400).json({
        message: 'Quiz is not active'
      });
    }

    await quiz.endQuiz();

    res.json({
      message: 'Quiz ended successfully',
      quiz
    });
  } catch (error) {
    console.error('End quiz error:', error);
    res.status(500).json({
      message: 'Server error while ending quiz'
    });
  }
});


router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    
    const hasResponses = await Response.findOne({ quiz: quiz._id });
    if (hasResponses) {
      return res.status(400).json({
        message: 'Cannot delete quiz with existing responses'
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      message: 'Server error while deleting quiz'
    });
  }
});

module.exports = router;





