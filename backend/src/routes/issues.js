const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const issueController = require('../controllers/issueController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { upload } = require('../middleware/upload');

// @route   POST /api/issues
// @access  Citizen only
router.post(
  '/',
  auth,
  roleCheck(['citizen']),
  upload.array('images', 5),
  [
    body('category')
      .isIn(['pothole', 'garbage', 'water_leak', 'street_light', 'drainage', 'other'])
      .withMessage('Invalid category'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  ],
  issueController.createIssue
);

// @route   GET /api/issues
// @access  All authenticated users
router.get('/', auth, issueController.getIssues);

// @route   GET /api/issues/nearby
// @access  All authenticated users
router.get('/nearby', auth, issueController.getNearbyIssues);

// @route   GET /api/issues/:id
// @access  All authenticated users (with role-based filtering)
router.get('/:id', auth, issueController.getIssue);

// @route   PATCH /api/issues/:id/verify
// @access  Municipality only
router.patch(
  '/:id/verify',
  auth,
  roleCheck(['municipality']),
  [
    body('approved').isBoolean().withMessage('Approved must be a boolean'),
  ],
  issueController.verifyIssue
);

// @route   PATCH /api/issues/:id/assign
// @access  Municipality only
router.patch(
  '/:id/assign',
  auth,
  roleCheck(['municipality']),
  [
    body('contractorId').notEmpty().withMessage('Contractor ID is required'),
  ],
  issueController.assignIssue
);

// @route   PATCH /api/issues/:id/status
// @access  Contractor only
router.patch(
  '/:id/status',
  auth,
  roleCheck(['contractor']),
  upload.array('images', 5),
  [
    body('status')
      .isIn(['in_progress', 'completed'])
      .withMessage('Invalid status'),
  ],
  issueController.updateStatus
);

// @route   PATCH /api/issues/:id/resolve
// @access  Municipality only
router.patch(
  '/:id/resolve',
  auth,
  roleCheck(['municipality']),
  issueController.resolveIssue
);

// @route   PATCH /api/issues/:id/reject-resolution
// @access  Municipality only
router.patch(
  '/:id/reject-resolution',
  auth,
  roleCheck(['municipality']),
  [body('rejectionReason').notEmpty().withMessage('Rejection reason is required')],
  issueController.rejectResolution
);

// @route   DELETE /api/issues/:id
// @access  Citizen (own issues only)
router.delete('/:id', auth, roleCheck(['citizen']), issueController.deleteIssue);

module.exports = router;
