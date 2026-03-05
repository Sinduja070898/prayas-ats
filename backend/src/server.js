require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const DEBUG_LOG = path.join(__dirname, '../../.cursor/debug.log');
function debugLog(location, message, data, hypothesisId) {
  const line = JSON.stringify({ location, message, data, hypothesisId, timestamp: Date.now() }) + '\n';
  try { fs.appendFileSync(DEBUG_LOG, line); } catch (_) { }
}

const app = express();
const PORT = process.env.PORT || 5001;

// Allow frontend origin(s) – in dev allow common localhost variants to avoid 403 from CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, allowedOrigins[0]);
  },
  credentials: true,
}));
app.use(express.json());

// #region agent log
app.use('/api', (req, res, next) => {
  debugLog('server.js:api-incoming', 'API request received', { method: req.method, path: req.path, url: req.url, origin: req.headers.origin }, 'H1');
  next();
});
// #endregion

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Assessment Platform API' });
});

const authRoutes = require('./routes/auth');
const applicationsRoutes = require('./routes/applications');
const questionsRoutes = require('./routes/questions');
const assessmentsRoutes = require('./routes/assessments');

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/assessments', assessmentsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
