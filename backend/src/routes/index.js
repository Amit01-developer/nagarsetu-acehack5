const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const issueRoutes = require('./issues');
const userRoutes = require('./users');
const notificationRoutes = require('./notifications');
const aiRoutes = require('./ai');
const feedbackRoutes = require('./feedback');

router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/feedback', feedbackRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
