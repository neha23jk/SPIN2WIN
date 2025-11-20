const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/announcements
// @desc    Get all active announcements
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { priority, limit = 10, page = 1 } = req.query;
    
    const query = { isActive: true };
    if (priority) {
      query.priority = priority;
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      message: 'Server error while fetching announcements'
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name email');

    if (!announcement) {
      return res.status(404).json({
        message: 'Announcement not found'
      });
    }

    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      message: 'Server error while fetching announcement'
    });
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Admin
router.post('/', authenticateToken, requireAdmin, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent')
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

    const { title, message, priority = 'medium', expiresAt } = req.body;

    const announcement = new Announcement({
      title,
      message,
      priority,
      author: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await announcement.save();
    await announcement.populate('author', 'name email');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      message: 'Server error while creating announcement'
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Admin
router.put('/:id', authenticateToken, requireAdmin, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent')
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

    const { title, message, priority, isActive, expiresAt } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        message: 'Announcement not found'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (message) updateData.message = message;
    if (priority) updateData.priority = priority;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      message: 'Server error while updating announcement'
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        message: 'Announcement not found'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      message: 'Server error while deleting announcement'
    });
  }
});

// @route   GET /api/announcements/admin/all
// @desc    Get all announcements (including inactive) - Admin only
// @access  Admin
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { priority, isActive, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (priority) query.priority = priority;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const announcements = await Announcement.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({
      message: 'Server error while fetching all announcements'
    });
  }
});

module.exports = router;





