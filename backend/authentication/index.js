// Main entry point for the authentication backend
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet()); // Set security-related HTTP headers

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => req.path === '/api/health' // Skip rate limiting for health check
});

app.use('/api/', limiter); // Apply rate limiting to all requests starting with /api/

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use('/public', express.static('public'));

// Import routes
const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');
const itemRoutes = require('./routes/item.routes');
const matchRoutes = require('./routes/match.routes');
const chatRoutes = require('./routes/chat.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');
const notificationRoutes = require('./routes/notification.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const impactRoutes = require('./routes/impact.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const savedListingRoutes = require('./routes/savedListing.routes');

// Error handling middleware
const errorHandler = require('./middleware/error.middleware');

const http = require('http');
const { initSocket } = require('./utils/socket');

// Supabase is now the primary database. 
// MongoDB connection has been removed.

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'ShareGoods API is running',
    healthCheck: '/api/health'
  });
});

// Health check route (moved up to be before any potential middleware)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Authentication service is running' });
});

// Routes
app.use('/api/auth', authRoutes); // All auth routes: login, register, password reset
app.use('/api/public', authRoutes); // Alias for backward compatibility if needed

// Protected routes (middleware applied within routers or per-route)
app.use('/api/protected', protectedRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/saved-listings', savedListingRoutes);
app.use('/api/ngo', require('./routes/ngo.dashboard.routes'));
app.use('/api/ai', require('./routes/ai.routes'));



// Error handling middleware
app.use(errorHandler);

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Authentication server running on port ${PORT}`);
});

module.exports = { app, server };