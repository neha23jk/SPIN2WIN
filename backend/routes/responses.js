const express = require('express');
const { body, validationResult } = require('express-validator');
const Response = require('../models/Response');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/responses
// @desc    Submit quiz response
// @access  Private
router.post('/', authenticateToken, [
  body('quizId')
    .isMongoId()
    .withMessage('Quiz ID must be a valid ID'),
  body('answer')
    .isInt({ min: 0 })
    .withMessage('Answer must be a non-negative integer'),
  body('responseTime')
    .isFloat({ min: 0 })
    .withMessage('Response time must be a non-negative number'),
  body('timeRemaining')
    .isFloat({ min: 0 })
    .withMessage('Time remaining must be a non-negative number')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { quizId, answer, responseTime, timeRemaining } = req.body;

    // Check if quiz exists and is active
    const quiz = await Quiz.findById(quizId);
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

    // Check if user already responded
    const existingResponse = await Response.findOne({ user: req.user._id, quiz: quizId });
    if (existingResponse) {
      return res.status(400).json({
        message: 'You have already responded to this quiz'
      });
    }

    // Validate answer index
    if (answer >= quiz.options.length) {
      return res.status(400).json({
        message: 'Answer index is out of range'
      });
    }

    // Check if answer is correct
    const isCorrect = answer === quiz.correctAnswer;
    const score = isCorrect ? quiz.points : 0;

    // Get user's current streak
    const lastResponse = await Response.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    let streak = 0;
    let totalStreak = 0;
    
    if (lastResponse) {
      if (lastResponse.isCorrect) {
        streak = lastResponse.streak + (isCorrect ? 1 : 0);
        totalStreak = Math.max(lastResponse.totalStreak, streak);
      } else {
        streak = isCorrect ? 1 : 0;
        totalStreak = lastResponse.totalStreak;
      }
    } else {
      streak = isCorrect ? 1 : 0;
      totalStreak = streak;
    }

    // Create response
    const response = new Response({
      user: req.user._id,
      quiz: quizId,
      answer,
      isCorrect,
      score,
      responseTime,
      timeRemaining,
      streak,
      totalStreak
    });

    await response.save();

    // Update quiz statistics
    quiz.totalResponses += 1;
    if (isCorrect) {
      quiz.correctResponses += 1;
    }
    await quiz.save();

    // Update user's total score
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalScore: score },
      $push: {
        quizResponses: {
          quizId: quizId,
          score: score,
          answeredAt: new Date()
        }
      }
    });

    res.status(201).json({
      message: 'Response submitted successfully',
      response: {
        id: response._id,
        isCorrect,
        score,
        streak,
        totalStreak
      }
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({
      message: 'Server error while submitting response'
    });
  }
});

// @route   GET /api/responses/user/:userId
// @desc    Get user's responses
// @access  Private (Admin or own responses)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user can access these responses
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const { limit = 20, page = 1 } = req.query;

    const responses = await Response.find({ user: req.params.userId })
      .populate('quiz', 'battleNumber question options points category difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Response.countDocuments({ user: req.params.userId });

    res.json({
      responses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user responses error:', error);
    res.status(500).json({
      message: 'Server error while fetching user responses'
    });
  }
});

// @route   GET /api/responses/quiz/:quizId
// @desc    Get quiz responses
// @access  Admin
router.get('/quiz/:quizId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    const responses = await Response.find({ quiz: req.params.quizId })
      .populate('user', 'name email institute')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Response.countDocuments({ quiz: req.params.quizId });

    res.json({
      responses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get quiz responses error:', error);
    res.status(500).json({
      message: 'Server error while fetching quiz responses'
    });
  }
});

// @route   GET /api/responses/leaderboard
// @desc    Get quiz leaderboard
// @access  Public
router.get('/leaderboard', optionalAuth, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'responses',
          localField: '_id',
          foreignField: 'user',
          as: 'responses'
        }
      },
      {
        $addFields: {
          totalScore: { $sum: '$responses.score' },
          totalResponses: { $size: '$responses' },
          correctResponses: {
            $size: {
              $filter: {
                input: '$responses',
                cond: { $eq: ['$$this.isCorrect', true] }
              }
            }
          }
        }
      },
      {
        $match: {
          totalResponses: { $gt: 0 }
        }
      },
      {
        $addFields: {
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$correctResponses', '$totalResponses'] }, 100] },
              2
            ]
          }
        }
      },
      {
        $sort: { totalScore: -1, accuracy: -1, totalResponses: -1 }
      },
      {
        $project: {
          name: 1,
          institute: 1,
          totalScore: 1,
          totalResponses: 1,
          correctResponses: 1,
          accuracy: 1
        }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ]);

    const total = await User.aggregate([
      {
        $lookup: {
          from: 'responses',
          localField: '_id',
          foreignField: 'user',
          as: 'responses'
        }
      },
      {
        $match: {
          'responses.0': { $exists: true }
        }
      },
      {
        $count: 'total'
      }
    ]);

    res.json({
      leaderboard,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil((total[0]?.total || 0) / limit),
        total: total[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      message: 'Server error while fetching leaderboard'
    });
  }
});

// @route   GET /api/responses/stats/:userId
// @desc    Get user statistics
// @access  Private (Admin or own stats)
router.get('/stats/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user can access these stats
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const stats = await Response.getUserStats(req.params.userId);

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching user statistics'
    });
  }
});

module.exports = router;





