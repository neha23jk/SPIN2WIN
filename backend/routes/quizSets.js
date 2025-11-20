const express = require('express');
const { body, validationResult } = require('express-validator');
const QuizSet = require('../models/QuizSet');
const Match = require('../models/Match');
const Blader = require('../models/Blader');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quiz-sets
// @desc    Get all quiz sets
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { isActive, isCompleted, battleNumber, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isCompleted !== undefined) query.isCompleted = isCompleted === 'true';
    if (battleNumber) query.battleNumber = battleNumber;

    const quizSets = await QuizSet.find(query)
      .populate('matchId', 'matchId player1 player2')
      .populate('matchId.player1', 'name arenaId')
      .populate('matchId.player2', 'name arenaId')
      .populate('matchResult.winner', 'name arenaId')
      .populate('matchResult.loser', 'name arenaId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await QuizSet.countDocuments(query);

    res.json({
      quizSets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get quiz sets error:', error);
    res.status(500).json({
      message: 'Server error while fetching quiz sets'
    });
  }
});

// @route   GET /api/quiz-sets/active
// @desc    Get currently active quiz set
// @access  Public
router.get('/active', optionalAuth, async (req, res) => {
  try {
    const activeQuizSet = await QuizSet.findOne({ isActive: true, isCompleted: false })
      .populate('matchId', 'matchId player1 player2')
      .populate('matchId.player1', 'name arenaId')
      .populate('matchId.player2', 'name arenaId')
      .sort({ createdAt: -1 });

    if (!activeQuizSet) {
      return res.json({ quizSet: null });
    }

    // Don't send correct answers to non-admin users
    const quizSetData = activeQuizSet.toObject();
    if (!req.user || req.user.role !== 'admin') {
      quizSetData.questions = quizSetData.questions.map(question => {
        const { correctAnswer, ...questionWithoutAnswer } = question;
        return questionWithoutAnswer;
      });
    }

    res.json({ quizSet: quizSetData });
  } catch (error) {
    console.error('Get active quiz set error:', error);
    res.status(500).json({
      message: 'Server error while fetching active quiz set'
    });
  }
});

// @route   GET /api/quiz-sets/:id
// @desc    Get single quiz set
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const quizSet = await QuizSet.findById(req.params.id)
      .populate('matchId', 'matchId player1 player2')
      .populate('matchId.player1', 'name arenaId')
      .populate('matchId.player2', 'name arenaId')
      .populate('matchResult.winner', 'name arenaId')
      .populate('matchResult.loser', 'name arenaId');
    
    if (!quizSet) {
      return res.status(404).json({
        message: 'Quiz set not found'
      });
    }

    // Don't send correct answers to non-admin users
    const quizSetData = quizSet.toObject();
    if (!req.user || req.user.role !== 'admin') {
      quizSetData.questions = quizSetData.questions.map(question => {
        const { correctAnswer, ...questionWithoutAnswer } = question;
        return questionWithoutAnswer;
      });
    }

    res.json({ quizSet: quizSetData });
  } catch (error) {
    console.error('Get quiz set error:', error);
    res.status(500).json({
      message: 'Server error while fetching quiz set'
    });
  }
});

// @route   POST /api/quiz-sets
// @desc    Create new quiz set
// @access  Admin
router.post('/', authenticateToken, requireAdmin, [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('battleNumber')
    .trim()
    .matches(/^[ESQF]\d+$/)
    .withMessage('Battle Number must be in format E1, S2, Q3, F1'),
  body('matchId')
    .isMongoId()
    .withMessage('Match ID must be a valid ID'),
  body('totalQuestions')
    .isInt({ min: 1, max: 20 })
    .withMessage('Total questions must be between 1 and 20'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Questions must be an array with at least 1 question')
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

    const { name, description, battleNumber, matchId, totalQuestions, questions } = req.body;

    // Verify match exists
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(400).json({
        message: 'Match not found'
      });
    }

    // Check if quiz set already exists for this battle number
    const existingQuizSet = await QuizSet.findOne({ battleNumber });
    if (existingQuizSet) {
      return res.status(400).json({
        message: 'Quiz set already exists for this battle number'
      });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || question.question.trim().length < 10) {
        return res.status(400).json({
          message: `Question ${i + 1}: Question must be at least 10 characters`
        });
      }
      if (!question.options || question.options.length < 2) {
        return res.status(400).json({
          message: `Question ${i + 1}: Must have at least 2 options`
        });
      }
      if (question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          message: `Question ${i + 1}: Correct answer index is out of range`
        });
      }
    }

    const quizSet = new QuizSet({
      name,
      description,
      battleNumber,
      matchId,
      totalQuestions,
      questions
    });

    await quizSet.save();
    await quizSet.populate('matchId', 'matchId player1 player2');
    await quizSet.populate('matchId.player1', 'name arenaId');
    await quizSet.populate('matchId.player2', 'name arenaId');

    res.status(201).json({
      message: 'Quiz set created successfully',
      quizSet
    });
  } catch (error) {
    console.error('Create quiz set error:', error);
    res.status(500).json({
      message: 'Server error while creating quiz set'
    });
  }
});

// @route   PUT /api/quiz-sets/:id
// @desc    Update quiz set
// @access  Admin
router.put('/:id', authenticateToken, requireAdmin, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('totalQuestions')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Total questions must be between 1 and 20')
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

    const { name, description, totalQuestions, questions } = req.body;

    const quizSet = await QuizSet.findById(req.params.id);
    if (!quizSet) {
      return res.status(404).json({
        message: 'Quiz set not found'
      });
    }

    // Don't allow updates if quiz set is active or completed
    if (quizSet.isActive || quizSet.isCompleted) {
      return res.status(400).json({
        message: 'Cannot update active or completed quiz set'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (totalQuestions) updateData.totalQuestions = totalQuestions;
    if (questions) {
      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.question || question.question.trim().length < 10) {
          return res.status(400).json({
            message: `Question ${i + 1}: Question must be at least 10 characters`
          });
        }
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({
            message: `Question ${i + 1}: Must have at least 2 options`
          });
        }
        if (question.correctAnswer >= question.options.length) {
          return res.status(400).json({
            message: `Question ${i + 1}: Correct answer index is out of range`
          });
        }
      }
      updateData.questions = questions;
    }

    const updatedQuizSet = await QuizSet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('matchId', 'matchId player1 player2')
    .populate('matchId.player1', 'name arenaId')
    .populate('matchId.player2', 'name arenaId');

    res.json({
      message: 'Quiz set updated successfully',
      quizSet: updatedQuizSet
    });
  } catch (error) {
    console.error('Update quiz set error:', error);
    res.status(500).json({
      message: 'Server error while updating quiz set'
    });
  }
});

// @route   POST /api/quiz-sets/:id/start
// @desc    Start quiz set
// @access  Admin
router.post('/:id/start', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quizSet = await QuizSet.findById(req.params.id);
    if (!quizSet) {
      return res.status(404).json({
        message: 'Quiz set not found'
      });
    }

    if (quizSet.isActive) {
      return res.status(400).json({
        message: 'Quiz set is already active'
      });
    }

    if (quizSet.isCompleted) {
      return res.status(400).json({
        message: 'Quiz set is already completed'
      });
    }

    await quizSet.startQuizSet();

    res.json({
      message: 'Quiz set started successfully',
      quizSet
    });
  } catch (error) {
    console.error('Start quiz set error:', error);
    res.status(500).json({
      message: 'Server error while starting quiz set'
    });
  }
});

// @route   POST /api/quiz-sets/:id/end
// @desc    End quiz set
// @access  Admin
router.post('/:id/end', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quizSet = await QuizSet.findById(req.params.id);
    if (!quizSet) {
      return res.status(404).json({
        message: 'Quiz set not found'
      });
    }

    if (!quizSet.isActive) {
      return res.status(400).json({
        message: 'Quiz set is not active'
      });
    }

    await quizSet.endQuizSet();

    res.json({
      message: 'Quiz set ended successfully',
      quizSet
    });
  } catch (error) {
    console.error('End quiz set error:', error);
    res.status(500).json({
      message: 'Server error while ending quiz set'
    });
  }
});

// @route   POST /api/quiz-sets/:id/match-result
// @desc    Set match result and update quiz answers
// @access  Admin
router.post('/:id/match-result', authenticateToken, requireAdmin, [
  body('winner')
    .isMongoId()
    .withMessage('Winner must be a valid ID'),
  body('battleType')
    .isIn(['burst', 'spin', 'ring_out', 'draw'])
    .withMessage('Battle type must be burst, spin, ring_out, or draw'),
  body('battleDuration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Battle duration must be a non-negative integer')
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

    const { winner, battleType, battleDuration } = req.body;

    const quizSet = await QuizSet.findById(req.params.id)
      .populate('matchId', 'player1 player2');
    
    if (!quizSet) {
      return res.status(404).json({
        message: 'Quiz set not found'
      });
    }

    // Verify winner is one of the match players
    const match = quizSet.matchId;
    if (winner !== match.player1.toString() && winner !== match.player2.toString()) {
      return res.status(400).json({
        message: 'Winner must be one of the match players'
      });
    }

    // Determine loser
    const loser = winner === match.player1.toString() ? match.player2 : match.player1;

    // Get blader details
    const [winnerBlader, loserBlader] = await Promise.all([
      Blader.findById(winner),
      Blader.findById(loser)
    ]);

    const matchResult = {
      winner: winnerBlader._id,
      loser: loserBlader._id,
      battleType,
      battleDuration: battleDuration || 0
    };

    await quizSet.setMatchResult(matchResult);

    res.json({
      message: 'Match result set successfully',
      quizSet
    });
  } catch (error) {
    console.error('Set match result error:', error);
    res.status(500).json({
      message: 'Server error while setting match result'
    });
  }
});

// @route   DELETE /api/quiz-sets/:id
// @desc    Delete quiz set
// @access  Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quizSet = await QuizSet.findById(req.params.id);
    if (!quizSet) {
      return res.status(404).json({
        message: 'Quiz set not found'
      });
    }

    // Check if quiz set is active
    if (quizSet.isActive) {
      return res.status(400).json({
        message: 'Cannot delete active quiz set'
      });
    }

    await QuizSet.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Quiz set deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz set error:', error);
    res.status(500).json({
      message: 'Server error while deleting quiz set'
    });
  }
});

module.exports = router;
