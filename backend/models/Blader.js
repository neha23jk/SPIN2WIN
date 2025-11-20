const mongoose = require('mongoose');

const bladerSchema = new mongoose.Schema({
  arenaId: {
    type: String,
    required: [true, 'Arena ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]\d+$/, 'Arena ID must be in format A1, B2, etc.']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  institute: {
    type: String,
    required: [true, 'Institute is required'],
    trim: true,
    maxlength: [100, 'Institute name cannot exceed 100 characters']
  },
  beyCombo: {
    type: String,
    required: [true, 'Bey Combo is required'],
    trim: true,
    maxlength: [100, 'Bey Combo cannot exceed 100 characters']
  },
  round: {
    type: String,
    enum: ['elementary', 'quarter', 'semi', 'final', 'champion'],
    default: 'elementary'
  },
  battleNumber: {
    type: String,
    required: [true, 'Battle Number is required'],
    trim: true,
    uppercase: true,
    match: [/^[ESQF]\d+$/, 'Battle Number must be in format E1, S2, Q3, F1']
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  isEliminated: {
    type: Boolean,
    default: false
  },
  currentMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    default: null
  },
  stats: {
    totalBattles: {
      type: Number,
      default: 0
    },
    averageBattleTime: {
      type: Number,
      default: 0
    },
    burstFinishes: {
      type: Number,
      default: 0
    },
    spinFinishes: {
      type: Number,
      default: 0
    },
    ringOutFinishes: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bladerSchema.index({ round: 1, isEliminated: 1 });
bladerSchema.index({ battleNumber: 1 });

// Virtual for win percentage
bladerSchema.virtual('winPercentage').get(function() {
  const total = this.wins + this.losses;
  return total > 0 ? Math.round((this.wins / total) * 100) : 0;
});

module.exports = mongoose.model('Blader', bladerSchema);
