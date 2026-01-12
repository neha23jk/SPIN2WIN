const mongoose = require('mongoose');

const quizSetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Quiz set name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  battleNumber: {
    type: String,
    required: [true, 'Battle Number is required'],
    trim: true,
    uppercase: true,
    match: [/^[ESQF]\d+$/, 'Battle Number must be in format E1, S2, Q3, F1']
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: [true, 'Match ID is required']
  },
  questions: [{
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
        message: 'Question must have between 2 and 6 options'
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
    isRevealed: {
      type: Boolean,
      default: false 
    }
  }],
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions is required'],
    min: [1, 'Must have at least 1 question'],
    max: [20, 'Cannot have more than 20 questions']
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
  totalResponses: {
    type: Number,
    default: 0
  },
  correctResponses: {
    type: Number,
    default: 0
  },
  
  matchResult: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blader',
      default: null
    },
    loser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blader',
      default: null
    },
    battleType: {
      type: String,
      enum: ['burst', 'spin', 'ring_out', 'draw'],
      default: null
    },
    battleDuration: {
      type: Number, 
      default: null
    },
    isResultSet: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});


quizSetSchema.index({ battleNumber: 1 });
quizSetSchema.index({ matchId: 1 });
quizSetSchema.index({ isActive: 1, isCompleted: 1 });


quizSetSchema.virtual('accuracyPercentage').get(function() {
  return this.totalResponses > 0 
    ? Math.round((this.correctResponses / this.totalResponses) * 100) 
    : 0;
});


quizSetSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});


quizSetSchema.methods.startQuizSet = function() {
  this.isActive = true;
  this.startedAt = new Date();
  return this.save();
};


quizSetSchema.methods.endQuizSet = function() {
  this.isActive = false;
  this.isCompleted = true;
  this.endedAt = new Date();
  return this.save();
};


quizSetSchema.methods.setMatchResult = async function(matchResult) {
  this.matchResult = {
    ...matchResult,
    isResultSet: true
  };
  
  
  this.questions.forEach(question => {
    if (question.category === 'battle_prediction') {
      
      if (question.question.includes('winner')) {
        
        const winnerName = matchResult.winner?.name;
        const winnerIndex = question.options.findIndex(option => 
          option.toLowerCase().includes(winnerName?.toLowerCase())
        );
        if (winnerIndex !== -1) {
          question.correctAnswer = winnerIndex;
        }
      } else if (question.question.includes('battle type') || question.question.includes('finish')) {
        
        const battleTypeIndex = question.options.findIndex(option => 
          option.toLowerCase().includes(matchResult.battleType?.toLowerCase())
        );
        if (battleTypeIndex !== -1) {
          question.correctAnswer = battleTypeIndex;
        }
      }
      question.isRevealed = true;
    }
  });
  
  return this.save();
};

module.exports = mongoose.model('QuizSet', quizSetSchema);
