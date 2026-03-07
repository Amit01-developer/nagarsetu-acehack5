const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// @route   GET /api/notifications
router.get('/', auth, notificationController.getNotifications);

// @route   PATCH /api/notifications/read-all
router.patch('/read-all', auth, notificationController.markAllAsRead);

// @route   PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
