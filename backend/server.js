const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spin2win')
.then(() => console.log('🚀 MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/bladers', require('./routes/bladers'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/quiz-sets', require('./routes/quizSets'));
app.use('/api/responses', require('./routes/responses'));
app.use('/api/event', require('./routes/event'));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Spin 2 Win API is running!',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
