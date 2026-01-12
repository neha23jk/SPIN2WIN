const express = require('express');
const { body, validationResult } = require('express-validator');
const Blader = require('../models/Blader');
const Match = require('../models/Match');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();


router.get('/', optionalAuth, async (req, res) => {
  try {
    const { round, isEliminated, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (round) query.round = round;
    if (isEliminated !== undefined) query.isEliminated = isEliminated === 'true';

    const bladers = await Blader.find(query)
      .sort({ round: 1, arenaId: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blader.countDocuments(query);

    res.json({
      bladers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get bladers error:', error);
    res.status(500).json({
      message: 'Server error while fetching bladers'
    });
  }
});


router.get('/top16', optionalAuth, async (req, res) => {
  try {
    const bladers = await Blader.find({ isEliminated: false })
      .sort({ wins: -1, winPercentage: -1, arenaId: 1 })
      .limit(16);

    res.json({ bladers });
  } catch (error) {
    console.error('Get top 16 bladers error:', error);
    res.status(500).json({
      message: 'Server error while fetching top 16 bladers'
    });
  }
});


router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const blader = await Blader.findById(req.params.id);
    
    if (!blader) {
      return res.status(404).json({
        message: 'Blader not found'
      });
    }

   
    const recentMatches = await Match.find({
      $or: [
        { player1: blader._id },
        { player2: blader._id }
      ]
    })
    .populate('player1', 'name arenaId')
    .populate('player2', 'name arenaId')
    .populate('winner', 'name arenaId')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({ 
      blader,
      recentMatches
    });
  } catch (error) {
    console.error('Get blader error:', error);
    res.status(500).json({
      message: 'Server error while fetching blader'
    });
  }
});


router.post('/', authenticateToken, requireAdmin, [
  body('arenaId')
    .trim()
    .matches(/^[A-Z]\d+$/)
    .withMessage('Arena ID must be in format A1, B2, etc.'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('institute')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Institute must be between 2 and 100 characters'),
  body('beyCombo')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bey Combo must be between 2 and 100 characters'),
  body('battleNumber')
    .trim()
    .matches(/^[ESQF]\d+$/)
    .withMessage('Battle Number must be in format E1, S2, Q3, F1')
], async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { arenaId, name, institute, beyCombo, battleNumber, round = 'elementary' } = req.body;

   
    const existingBlader = await Blader.findOne({ arenaId });
    if (existingBlader) {
      return res.status(400).json({
        message: 'Arena ID already exists'
      });
    }

    const blader = new Blader({
      arenaId,
      name,
      institute,
      beyCombo,
      battleNumber,
      round
    });

    await blader.save();

    res.status(201).json({
      message: 'Blader created successfully',
      blader
    });
  } catch (error) {
    console.error('Create blader error:', error);
    res.status(500).json({
      message: 'Server error while creating blader'
    });
  }
});


router.put('/:id', authenticateToken, requireAdmin, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('institute')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Institute must be between 2 and 100 characters'),
  body('beyCombo')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bey Combo must be between 2 and 100 characters'),
  body('round')
    .optional()
    .isIn(['elementary', 'quarter', 'semi', 'final', 'champion'])
    .withMessage('Round must be elementary, quarter, semi, final, or champion')
], async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, institute, beyCombo, round, isEliminated } = req.body;

    const blader = await Blader.findById(req.params.id);
    if (!blader) {
      return res.status(404).json({
        message: 'Blader not found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (institute) updateData.institute = institute;
    if (beyCombo) updateData.beyCombo = beyCombo;
    if (round) updateData.round = round;
    if (typeof isEliminated === 'boolean') updateData.isEliminated = isEliminated;

    const updatedBlader = await Blader.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Blader updated successfully',
      blader: updatedBlader
    });
  } catch (error) {
    console.error('Update blader error:', error);
    res.status(500).json({
      message: 'Server error while updating blader'
    });
  }
});


router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const blader = await Blader.findById(req.params.id);
    if (!blader) {
      return res.status(404).json({
        message: 'Blader not found'
      });
    }

    
    const hasMatches = await Match.findOne({
      $or: [
        { player1: blader._id },
        { player2: blader._id }
      ]
    });

    if (hasMatches) {
      return res.status(400).json({
        message: 'Cannot delete blader with existing matches'
      });
    }

    await Blader.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Blader deleted successfully'
    });
  } catch (error) {
    console.error('Delete blader error:', error);
    res.status(500).json({
      message: 'Server error while deleting blader'
    });
  }
});


router.get('/bracket/current', optionalAuth, async (req, res) => {
  try {
    const bracket = {
      elementary: await Blader.find({ round: 'elementary', isEliminated: false }).sort({ arenaId: 1 }),
      quarter: await Blader.find({ round: 'quarter', isEliminated: false }).sort({ arenaId: 1 }),
      semi: await Blader.find({ round: 'semi', isEliminated: false }).sort({ arenaId: 1 }),
      final: await Blader.find({ round: 'final', isEliminated: false }).sort({ arenaId: 1 }),
      champion: await Blader.find({ round: 'champion' }).sort({ arenaId: 1 })
    };

    res.json({ bracket });
  } catch (error) {
    console.error('Get bracket error:', error);
    res.status(500).json({
      message: 'Server error while fetching bracket'
    });
  }
});

module.exports = router;





