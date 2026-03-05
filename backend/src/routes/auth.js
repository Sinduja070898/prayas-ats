const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { getUserByEmail, createUser } = require('../store');

const DEBUG_LOG = path.join(__dirname, '../../../.cursor/debug.log');
function debugLog(location, message, data, hypothesisId) {
  const line = JSON.stringify({ location, message, data, hypothesisId, timestamp: Date.now() }) + '\n';
  try { fs.appendFileSync(DEBUG_LOG, line); } catch (_) { }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// POST /api/auth/register — Public (candidate)
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password required' });
  }
  const existing = getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Sign in instead.' });
  }
  const user = createUser({ email, name, password, role: 'candidate' });
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: 'candidate' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.status(201).json({
    token,
    user: { _id: user.id, id: user.id, email: user.email, name: user.name, role: 'candidate' },
  });
});

// POST /api/auth/login — Public (body may include role: 'admin')
router.post('/login', (req, res) => {
  // #region agent log
  debugLog('auth.js:login-handler', 'Login handler entered', { hasBody: !!req.body }, 'H2');
  // #endregion
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const r = (role || 'candidate').toLowerCase();

  if (r === 'admin') {
    // Admin: no user store on backend for now; reject with clear message
    return res.status(401).json({ error: 'No admin account found with this email.' });
  }

  // Candidate: validate against store
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email. Please register first.' });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: 'candidate' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  // #region agent log
  debugLog('auth.js:login-success', 'Login sending 200', {}, 'H3');
  // #endregion
  res.json({
    token,
    user: { _id: user.id, id: user.id, email: user.email, name: user.name, role: 'candidate' },
  });
});

// GET /api/auth/me — Auth (any authenticated user)
router.get('/me', auth, (req, res) => {
  res.json({
    user: {
      _id: req.user.userId || 'placeholder',
      id: req.user.userId,
      email: req.user.email,
      name: req.user.email?.split('@')[0] || 'User',
      role: req.user.role,
    },
  });
});

module.exports = router;
