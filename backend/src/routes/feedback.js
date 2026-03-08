const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const feedbackController = require('../controllers/feedbackController');

router.post(
  '/',
  auth,
  roleCheck(['citizen']),
  [
    body('complaintId').notEmpty().withMessage('complaintId is required'),
    body('qualityRating').isInt({ min: 1, max: 5 }).withMessage('qualityRating must be between 1 and 5'),
    body('speedRating').isInt({ min: 1, max: 5 }).withMessage('speedRating must be between 1 and 5'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 500 }).withMessage('comment too long'),
  ],
  feedbackController.submitFeedback
);

router.get('/mine', auth, roleCheck(['citizen']), feedbackController.getMyFeedback);

module.exports = router;
