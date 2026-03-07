const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/users/profile
router.get('/profile', auth, userController.getProfile);

// @route   PATCH /api/users/profile
router.patch(
  '/profile',
  auth,
  [
    body('profile.name')
      .optional()
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('profile.phone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
  ],
  userController.updateProfile
);

// @route   GET /api/users/points
// @access  Citizen only
router.get('/points', auth, roleCheck(['citizen']), userController.getPoints);

// @route   GET /api/users/contractors/companies
// @access  Municipality only
router.get('/contractors/companies', auth, roleCheck(['municipality']), userController.getContractorCompanies);

// @route   GET /api/users/contractors
// @access  Municipality only
router.get('/contractors', auth, roleCheck(['municipality']), userController.getContractors);

// @route   POST /api/users/device-token
router.post('/device-token', auth, userController.registerDeviceToken);

// @route   GET /api/users/leaderboard
router.get('/leaderboard', auth, userController.getLeaderboard);

// @route   GET /api/users/profile-full
// @access  Citizen only
router.get('/profile-full', auth, roleCheck(['citizen']), userController.getProfileFull);

module.exports = router;
