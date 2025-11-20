const express = require('express');
const { body, validationResult } = require('express-validator');
const Match = require('../models/Match');
const Blader = require('../models/Blader');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/matches
// @desc    Get all matches
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { round, status, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (round) query.round = round;
    if (status) query.status = status;

    const matches = await Match.find(query)
      .populate('player1', 'name arenaId beyCombo')
      .populate('player2', 'name arenaId beyCombo')
      .populate('winner', 'name arenaId')
      .populate('loser', 'name arenaId')
      .sort({ scheduledAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Match.countDocuments(query);

    res.json({
      matches,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      message: 'Server error while fetching matches'
    });
  }
});

// @route   GET /api/matches/:id
// @desc    Get single match
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('player1', 'name arenaId beyCombo institute')
      .populate('player2', 'name arenaId beyCombo institute')
      .populate('winner', 'name arenaId')
      .populate('loser', 'name arenaId');

    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }

    res.json({ match });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      message: 'Server error while fetching match'
    });
  }
});

// @route   POST /api/matches
// @desc    Create new match
// @access  Admin
router.post('/', authenticateToken, requireAdmin, [
  body('matchId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Match ID must be between 3 and 20 characters'),
  body('round')
    .isIn(['elementary', 'quarter', 'semi', 'final', 'championship'])
    .withMessage('Round must be elementary, quarter, semi, final, or championship'),
  body('player1')
    .isMongoId()
    .withMessage('Player 1 must be a valid ID'),
  body('player2')
    .isMongoId()
    .withMessage('Player 2 must be a valid ID'),
  body('arenaId')
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Arena ID must be between 2 and 10 characters'),
  body('battleNumber')
    .trim()
    .matches(/^[ESQF]\d+$/)
    .withMessage('Battle Number must be in format E1, S2, Q3, F1'),
  body('scheduledAt')
    .isISO8601()
    .withMessage('Scheduled time must be a valid date')
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

    const { matchId, round, player1, player2, arenaId, battleNumber, scheduledAt, notes } = req.body;

    // Check if match ID already exists
    const existingMatch = await Match.findOne({ matchId });
    if (existingMatch) {
      return res.status(400).json({
        message: 'Match ID already exists'
      });
    }

    // Verify players exist
    const [player1Data, player2Data] = await Promise.all([
      Blader.findById(player1),
      Blader.findById(player2)
    ]);

    if (!player1Data || !player2Data) {
      return res.status(400).json({
        message: 'One or both players not found'
      });
    }

    const match = new Match({
      matchId,
      round,
      player1,
      player2,
      arenaId,
      battleNumber,
      scheduledAt: new Date(scheduledAt),
      notes
    });

    await match.save();
    await match.populate('player1', 'name arenaId beyCombo');
    await match.populate('player2', 'name arenaId beyCombo');

    res.status(201).json({
      message: 'Match created successfully',
      match
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({
      message: 'Server error while creating match'
    });
  }
});

// @route   PUT /api/matches/:id
// @desc    Update match
// @access  Admin
router.put('/:id', authenticateToken, requireAdmin, [
  body('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be scheduled, in_progress, completed, or cancelled'),
  body('battleType')
    .optional()
    .isIn(['burst', 'spin', 'ring_out', 'draw'])
    .withMessage('Battle type must be burst, spin, ring_out, or draw'),
  body('winner')
    .optional()
    .isMongoId()
    .withMessage('Winner must be a valid ID')
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

    const { status, battleType, winner, battleDuration, score, notes } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'in_progress') {
        updateData.startedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }
    if (battleType) updateData.battleType = battleType;
    if (winner) {
      updateData.winner = winner;
      updateData.loser = winner.toString() === match.player1.toString() ? match.player2 : match.player1;
    }
    if (battleDuration) updateData.battleDuration = battleDuration;
    if (score) updateData.score = score;
    if (notes) updateData.notes = notes;

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('player1', 'name arenaId beyCombo')
    .populate('player2', 'name arenaId beyCombo')
    .populate('winner', 'name arenaId')
    .populate('loser', 'name arenaId');

    // Update blader stats if match is completed
    if (status === 'completed' && winner) {
      const winnerBlader = await Blader.findById(winner);
      const loserBlader = await Blader.findById(updatedMatch.loser);
      
      if (winnerBlader) {
        winnerBlader.wins += 1;
        winnerBlader.stats.totalBattles += 1;
        if (battleType === 'burst') winnerBlader.stats.burstFinishes += 1;
        else if (battleType === 'spin') winnerBlader.stats.spinFinishes += 1;
        else if (battleType === 'ring_out') winnerBlader.stats.ringOutFinishes += 1;
        await winnerBlader.save();
      }
      
      if (loserBlader) {
        loserBlader.losses += 1;
        loserBlader.stats.totalBattles += 1;
        await loserBlader.save();
      }
    }

    res.json({
      message: 'Match updated successfully',
      match: updatedMatch
    });
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({
      message: 'Server error while updating match'
    });
  }
});

// @route   DELETE /api/matches/:id
// @desc    Delete match
// @access  Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }

    // Check if match is completed
    if (match.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot delete completed match'
      });
    }

    await Match.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({
      message: 'Server error while deleting match'
    });
  }
});

// @route   GET /api/matches/round/:round
// @desc    Get matches by round
// @access  Public
router.get('/round/:round', optionalAuth, async (req, res) => {
  try {
    const { round } = req.params;
    const { status } = req.query;

    const query = { round };
    if (status) query.status = status;

    const matches = await Match.find(query)
      .populate('player1', 'name arenaId beyCombo')
      .populate('player2', 'name arenaId beyCombo')
      .populate('winner', 'name arenaId')
      .populate('loser', 'name arenaId')
      .sort({ scheduledAt: 1 });

    res.json({ matches });
  } catch (error) {
    console.error('Get matches by round error:', error);
    res.status(500).json({
      message: 'Server error while fetching matches by round'
    });
  }
});

module.exports = router;





