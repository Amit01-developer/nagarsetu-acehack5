const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role')
      .isIn(['citizen', 'municipality', 'contractor'])
      .withMessage('Invalid role'),
    body('profile.name').notEmpty().withMessage('Name is required'),
  ],
  authController.register
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

// @route   POST /api/auth/request-email-otp
router.post(
  '/request-email-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
  ],
  authController.requestEmailOtp
);

// @route   POST /api/auth/verify-email-otp
router.post(
  '/verify-email-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('otp')
      .matches(/^\d{6}$/)
      .withMessage('OTP must be a 6-digit code'),
  ],
  authController.verifyEmailOtp
);

// @route   POST /api/auth/logout
router.post('/logout', auth, authController.logout);

// @route   GET /api/auth/me
router.get('/me', auth, authController.getMe);

// @route   POST /api/auth/refresh-token
router.post('/refresh-token', auth, authController.refreshToken);

module.exports = router;
