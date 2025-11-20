const express = require('express');
const { body, validationResult } = require('express-validator');
const EventInfo = require('../models/EventInfo');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/event
// @desc    Get event information
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const eventInfo = await EventInfo.findOne({ isActive: true })
      .sort({ createdAt: -1 });

    if (!eventInfo) {
      return res.status(404).json({
        message: 'Event information not found'
      });
    }

    res.json({ eventInfo });
  } catch (error) {
    console.error('Get event info error:', error);
    res.status(500).json({
      message: 'Server error while fetching event information'
    });
  }
});

// @route   PUT /api/event
// @desc    Update event information
// @access  Admin
router.put('/', authenticateToken, requireAdmin, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('descriptionShort')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Short description must be between 10 and 200 characters'),
  body('descriptionDetailed')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Detailed description must be between 20 and 2000 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('time')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Time must be between 1 and 20 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters')
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

    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.registrationOpen) updateData.registrationOpen = new Date(updateData.registrationOpen);
    if (updateData.registrationClose) updateData.registrationClose = new Date(updateData.registrationClose);
    if (updateData.quizStart) updateData.quizStart = new Date(updateData.quizStart);
    if (updateData.quizEnd) updateData.quizEnd = new Date(updateData.quizEnd);
    if (updateData.tournamentStart) updateData.tournamentStart = new Date(updateData.tournamentStart);
    if (updateData.tournamentEnd) updateData.tournamentEnd = new Date(updateData.tournamentEnd);

    const eventInfo = await EventInfo.findOneAndUpdate(
      { isActive: true },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      message: 'Event information updated successfully',
      eventInfo
    });
  } catch (error) {
    console.error('Update event info error:', error);
    res.status(500).json({
      message: 'Server error while updating event information'
    });
  }
});

// @route   POST /api/event
// @desc    Create event information
// @access  Admin
router.post('/', authenticateToken, requireAdmin, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('descriptionShort')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Short description must be between 10 and 200 characters'),
  body('descriptionDetailed')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Detailed description must be between 20 and 2000 characters'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('time')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Time must be between 1 and 20 characters'),
  body('location')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters'),
  body('registrationOpen')
    .isISO8601()
    .withMessage('Registration open date must be a valid ISO 8601 date'),
  body('registrationClose')
    .isISO8601()
    .withMessage('Registration close date must be a valid ISO 8601 date'),
  body('quizStart')
    .isISO8601()
    .withMessage('Quiz start date must be a valid ISO 8601 date'),
  body('quizEnd')
    .isISO8601()
    .withMessage('Quiz end date must be a valid ISO 8601 date'),
  body('tournamentStart')
    .isISO8601()
    .withMessage('Tournament start date must be a valid ISO 8601 date'),
  body('tournamentEnd')
    .isISO8601()
    .withMessage('Tournament end date must be a valid ISO 8601 date')
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

    const {
      title,
      descriptionShort,
      descriptionDetailed,
      date,
      time,
      location,
      registrationOpen,
      registrationClose,
      quizStart,
      quizEnd,
      tournamentStart,
      tournamentEnd,
      maxParticipants = 16,
      entryFee = 0,
      prizes = {},
      rules = [],
      contactInfo = {},
      socialLinks = {},
      theme = {}
    } = req.body;

    // Deactivate existing event info
    await EventInfo.updateMany({}, { isActive: false });

    const eventInfo = new EventInfo({
      title,
      descriptionShort,
      descriptionDetailed,
      date: new Date(date),
      time,
      location,
      registrationOpen: new Date(registrationOpen),
      registrationClose: new Date(registrationClose),
      quizStart: new Date(quizStart),
      quizEnd: new Date(quizEnd),
      tournamentStart: new Date(tournamentStart),
      tournamentEnd: new Date(tournamentEnd),
      maxParticipants,
      entryFee,
      prizes,
      rules,
      contactInfo,
      socialLinks,
      theme
    });

    await eventInfo.save();

    res.status(201).json({
      message: 'Event information created successfully',
      eventInfo
    });
  } catch (error) {
    console.error('Create event info error:', error);
    res.status(500).json({
      message: 'Server error while creating event information'
    });
  }
});

// @route   GET /api/event/status
// @desc    Get event status
// @access  Public
router.get('/status', optionalAuth, async (req, res) => {
  try {
    const eventInfo = await EventInfo.findOne({ isActive: true })
      .sort({ createdAt: -1 });

    if (!eventInfo) {
      return res.status(404).json({
        message: 'Event information not found'
      });
    }

    const status = eventInfo.status;
    const now = new Date();

    res.json({
      status,
      currentTime: now,
      eventInfo: {
        title: eventInfo.title,
        date: eventInfo.date,
        time: eventInfo.time,
        location: eventInfo.location,
        registrationOpen: eventInfo.registrationOpen,
        registrationClose: eventInfo.registrationClose,
        quizStart: eventInfo.quizStart,
        quizEnd: eventInfo.quizEnd,
        tournamentStart: eventInfo.tournamentStart,
        tournamentEnd: eventInfo.tournamentEnd
      }
    });
  } catch (error) {
    console.error('Get event status error:', error);
    res.status(500).json({
      message: 'Server error while fetching event status'
    });
  }
});

module.exports = router;





