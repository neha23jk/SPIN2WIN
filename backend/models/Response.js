const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz is required']
  },
  answer: {
    type: Number, // Index of selected option (0-based)
    required: [true, 'Answer is required'],
    min: [0, 'Answer index must be non-negative']
  },
  isCorrect: {
    type: Boolean,
    required: [true, 'isCorrect flag is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  responseTime: {
    type: Number, // in seconds
    required: [true, 'Response time is required'],
    min: [0, 'Response time cannot be negative']
  },
  timeRemaining: {
    type: Number, // in seconds
    required: [true, 'Time remaining is required'],
    min: [0, 'Time remaining cannot be negative']
  },
  streak: {
    type: Number,
    default: 0
  },
  totalStreak: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate responses
responseSchema.index({ user: 1, quiz: 1 }, { unique: true });

// Indexes for efficient queries
responseSchema.index({ user: 1, isCorrect: 1 });
responseSchema.index({ quiz: 1, isCorrect: 1 });
responseSchema.index({ createdAt: -1 });

// Virtual for response accuracy
responseSchema.virtual('accuracy').get(function() {
  return this.isCorrect ? 100 : 0;
});

// Static method to get user statistics
responseSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalResponses: { $sum: 1 },
        correctResponses: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        totalScore: { $sum: '$score' },
        averageResponseTime: { $avg: '$responseTime' },
        currentStreak: { $last: '$streak' },
        maxStreak: { $max: '$totalStreak' }
      }
    }
  ]);
  
  return stats[0] || {
    totalResponses: 0,
    correctResponses: 0,
    totalScore: 0,
    averageResponseTime: 0,
    currentStreak: 0,
    maxStreak: 0
  };
};

module.exports = mongoose.model('Response', responseSchema);





