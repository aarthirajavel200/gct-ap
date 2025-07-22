require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',              // Local dev
  'https://gct-ap.vercel.app'          // Deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'Server running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB (non-blocking)
connectDB();

// Routes
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/po', require('./routes/poRoutes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
