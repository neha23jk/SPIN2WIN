const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  battleNumber: {
    type: String,
    required: [true, 'Battle Number is required'],
    trim: true,
    uppercase: true,
    match: [/^[ESQF]\d+$/, 'Battle Number must be in format E1, S2, Q3, F1']
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function(options) {
        return options.length >= 2 && options.length <= 6;
      },
      message: 'Quiz must have between 2 and 6 options'
    }
  },
  correctAnswer: {
    type: Number, 
    required: [true, 'Correct answer is required'],
    min: [0, 'Correct answer index must be non-negative'],
    validate: {
      validator: function(correctAnswer) {
        return correctAnswer < this.options.length;
      },
      message: 'Correct answer index must be within options range'
    }
  },
  points: {
    type: Number,
    default: 3,
    min: [1, 'Points must be at least 1'],
    max: [10, 'Points cannot exceed 10']
  },
  timeLimit: {
    type: Number, 
    default: 30,
    min: [10, 'Time limit must be at least 10 seconds'],
    max: [300, 'Time limit cannot exceed 5 minutes']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ['battle_prediction', 'beyblade_knowledge', 'strategy', 'general'],
    default: 'battle_prediction'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  totalResponses: {
    type: Number,
    default: 0
  },
  correctResponses: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

quizSchema.index({ battleNumber: 1 });
quizSchema.index({ isActive: 1, isCompleted: 1 });
quizSchema.index({ category: 1, difficulty: 1 });

quizSchema.virtual('accuracyPercentage').get(function() {
  return this.totalResponses > 0 
    ? Math.round((this.correctResponses / this.totalResponses) * 100) 
    : 0;
});

quizSchema.methods.startQuiz = function() {
  this.isActive = true;
  this.startedAt = new Date();
  return this.save();
};

quizSchema.methods.endQuiz = function() {
  this.isActive = false;
  this.isCompleted = true;
  this.endedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema);





