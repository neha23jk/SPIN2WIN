const mongoose = require('mongoose');

const eventInfoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  descriptionShort: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  descriptionDetailed: {
    type: String,
    required: [true, 'Detailed description is required'],
    trim: true,
    maxlength: [2000, 'Detailed description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  registrationOpen: {
    type: Date,
    required: [true, 'Registration open date is required']
  },
  registrationClose: {
    type: Date,
    required: [true, 'Registration close date is required']
  },
  quizStart: {
    type: Date,
    required: [true, 'Quiz start date is required']
  },
  quizEnd: {
    type: Date,
    required: [true, 'Quiz end date is required']
  },
  tournamentStart: {
    type: Date,
    required: [true, 'Tournament start date is required']
  },
  tournamentEnd: {
    type: Date,
    required: [true, 'Tournament end date is required']
  },
  maxParticipants: {
    type: Number,
    default: 16,
    min: [8, 'Minimum 8 participants required'],
    max: [32, 'Maximum 32 participants allowed']
  },
  entryFee: {
    type: Number,
    default: 0,
    min: [0, 'Entry fee cannot be negative']
  },
  prizes: {
    first: {
      type: String,
      trim: true,
      maxlength: [100, 'First prize description cannot exceed 100 characters']
    },
    second: {
      type: String,
      trim: true,
      maxlength: [100, 'Second prize description cannot exceed 100 characters']
    },
    third: {
      type: String,
      trim: true,
      maxlength: [100, 'Third prize description cannot exceed 100 characters']
    }
  },
  rules: [{
    type: String,
    trim: true,
    maxlength: [500, 'Rule cannot exceed 500 characters']
  }],
  contactInfo: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    whatsapp: {
      type: String,
      trim: true,
      maxlength: [20, 'WhatsApp number cannot exceed 20 characters']
    }
  },
  socialLinks: {
    instagram: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#00f6ff'
    },
    secondaryColor: {
      type: String,
      default: '#ff004d'
    },
    accentColor: {
      type: String,
      default: '#faff00'
    }
  }
}, {
  timestamps: true
});

eventInfoSchema.index({ isActive: 1 });

eventInfoSchema.virtual('status').get(function() {
  const now = new Date();
  
  if (now < this.registrationOpen) {
    return 'upcoming';
  } else if (now >= this.registrationOpen && now <= this.registrationClose) {
    return 'registration_open';
  } else if (now > this.registrationClose && now < this.quizStart) {
    return 'registration_closed';
  } else if (now >= this.quizStart && now <= this.quizEnd) {
    return 'quiz_active';
  } else if (now > this.quizEnd && now < this.tournamentStart) {
    return 'quiz_completed';
  } else if (now >= this.tournamentStart && now <= this.tournamentEnd) {
    return 'tournament_active';
  } else {
    return 'completed';
  }
});

module.exports = mongoose.model('EventInfo', eventInfoSchema);





