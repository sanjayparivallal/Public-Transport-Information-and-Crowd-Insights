const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv    = require('dotenv');
const morgan    = require('morgan');

dotenv.config();

const connectDB          = require('./config/db');
const { errorHandler }   = require('./middleware/errorMiddleware');

// ── Route imports ────────────────────────────────────────────────────
const authRoutes          = require('./routes/auth');
const userRoutes          = require('./routes/users');
const transportRoutes     = require('./routes/transport');
const routeScheduleRoutes = require('./routes/routeSchedule');
const crowdRoutes         = require('./routes/crowd');
const incidentRoutes      = require('./routes/incidents');
const chatbotRoutes       = require('./routes/chatbot');

const app = express();

// ── Core middleware ──────────────────────────────────────────────────
// Logger: dev format in dev, structured combined in production
const skipImages = (req) => req.originalUrl.endsWith('/image');
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev', { skip: skipImages }));
} else {
  app.use(morgan('combined', { skip: skipImages }));
}

// Restrict CORS to the configured frontend origin (or localhost in development)
const allowedOrigin =
  process.env.FRONTEND_ORIGIN ||
  (process.env.NODE_ENV !== 'production' ? 'http://localhost:5173' : null);

app.use(cors({
  origin: allowedOrigin || false, // false = block all cross-origin in prod if not set
  credentials: false,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Rate limiting ────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});
app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// ── API routes ───────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/transport',  transportRoutes);

// Nested: GET/POST/PUT/DELETE /api/transport/:transportId/routes
app.use('/api/transport/:transportId/routes', routeScheduleRoutes);

app.use('/api/crowd',      crowdRoutes);
app.use('/api/incidents',  incidentRoutes);
app.use('/api/chatbot',    chatbotRoutes);

// ── Health check ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Public Transport API is running 🚀' });
});

// ── 404 handler ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global error handler (must be last) ──────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
