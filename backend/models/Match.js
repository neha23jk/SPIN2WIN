const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: [true, 'Match ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  round: {
    type: String,
    enum: ['elementary', 'quarter', 'semi', 'final', 'championship'],
    required: [true, 'Round is required']
  },
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blader',
    required: [true, 'Player 1 is required']
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blader',
    required: [true, 'Player 2 is required']
  },
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
  arenaId: {
    type: String,
    required: [true, 'Arena ID is required'],
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
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
  battleNumber: {
    type: String,
    required: [true, 'Battle Number is required'],
    trim: true,
    uppercase: true
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled time is required']
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  score: {
    player1: {
      type: Number,
      default: 0
    },
    player2: {
      type: Number,
      default: 0
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

matchSchema.index({ round: 1, status: 1 });
matchSchema.index({ scheduledAt: 1 });
matchSchema.index({ player1: 1, player2: 1 });

matchSchema.virtual('result').get(function() {
  if (this.status === 'completed' && this.winner) {
    return {
      winner: this.winner,
      loser: this.loser,
      battleType: this.battleType,
      duration: this.battleDuration
    };
  }
  return null;
});

module.exports = mongoose.model('Match', matchSchema);
