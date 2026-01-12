const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Blader = require('../models/Blader');
const Quiz = require('../models/Quiz');
const Match = require('../models/Match');
const Announcement = require('../models/Announcement');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();


router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

   
    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required'
      });
    }

    
    if (!user.isActive) {
      return res.status(400).json({
        message: 'Account is deactivated'
      });
    }

    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

   
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institute: user.institute,
        role: user.role,
        totalScore: user.totalScore
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: 'Server error during admin login'
    });
  }
});


router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalBladers,
      activeQuizzes,
      totalMatches,
      totalAnnouncements,
      recentAnnouncements,
      topBladers
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Blader.countDocuments({ isEliminated: false }),
      Quiz.countDocuments({ isActive: true, isCompleted: false }),
      Match.countDocuments(),
      Announcement.countDocuments({ isActive: true }),
      Announcement.find({ isActive: true })
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Blader.find({ isEliminated: false })
        .sort({ wins: -1, winPercentage: -1 })
        .limit(5)
    ]);

    res.json({
      stats: {
        totalUsers,
        totalBladers,
        activeQuizzes,
        totalMatches,
        totalAnnouncements
      },
      recentAnnouncements,
      topBladers
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching dashboard statistics'
    });
  }
});


router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, page = 1, search, role } = req.query;
    
    const query = { isActive: true };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { institute: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error while fetching users'
    });
  }
});


router.put('/users/:id/role', authenticateToken, requireAdmin, [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.body;
    const userId = req.params.id;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      message: 'Server error while updating user role'
    });
  }
});


router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      message: 'Server error while updating user status'
    });
  }
});


router.get('/export/bladers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const bladers = await Blader.find()
      .sort({ round: 1, arenaId: 1 });

    if (format === 'csv') {
      const csvHeader = 'Arena ID,Name,Institute,Bey Combo,Battle Number,Round,Wins,Losses,Win Percentage,Is Eliminated\n';
      const csvData = bladers.map(blader => 
        `${blader.arenaId},${blader.name},${blader.institute},${blader.beyCombo},${blader.battleNumber},${blader.round},${blader.wins},${blader.losses},${blader.winPercentage},${blader.isEliminated}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bladers.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        bladers,
        exportedAt: new Date().toISOString(),
        total: bladers.length
      });
    }
  } catch (error) {
    console.error('Export bladers error:', error);
    res.status(500).json({
      message: 'Server error while exporting bladers data'
    });
  }
});


router.get('/export/matches', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const matches = await Match.find()
      .populate('player1', 'name arenaId')
      .populate('player2', 'name arenaId')
      .populate('winner', 'name arenaId')
      .populate('loser', 'name arenaId')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvHeader = 'Match ID,Round,Player 1,Player 2,Winner,Loser,Arena ID,Battle Number,Status,Battle Type,Duration,Scheduled At,Completed At\n';
      const csvData = matches.map(match => 
        `${match.matchId},${match.round},${match.player1?.name || 'N/A'},${match.player2?.name || 'N/A'},${match.winner?.name || 'N/A'},${match.loser?.name || 'N/A'},${match.arenaId},${match.battleNumber},${match.status},${match.battleType || 'N/A'},${match.battleDuration || 'N/A'},${match.scheduledAt},${match.completedAt || 'N/A'}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=matches.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        matches,
        exportedAt: new Date().toISOString(),
        total: matches.length
      });
    }
  } catch (error) {
    console.error('Export matches error:', error);
    res.status(500).json({
      message: 'Server error while exporting matches data'
    });
  }
});

module.exports = router;
