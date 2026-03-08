const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Issue = require('../models/Issue');

// @desc    Submit citizen feedback for a resolved complaint
// @route   POST /api/feedback
// @access  Private (Citizen)
exports.submitFeedback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { complaintId, rating, comment, qualityRating, speedRating } = req.body;

    const issue = await Issue.findById(complaintId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only rate your own complaints.' });
    }

    if (issue.status !== 'resolved' && issue.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback is allowed after resolution.' });
    }

    const computedRating =
      rating ??
      (Math.round(((Number(qualityRating) || 0) + (Number(speedRating) || 0)) / 2) || 1);
    const normalizedRating = Math.min(5, Math.max(1, computedRating));

    const feedback = await Feedback.findOneAndUpdate(
      { complaint: complaintId, user: req.user._id },
      {
        rating: normalizedRating,
        qualityRating,
        speedRating,
        comment,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List feedback for analytics or user history
// @route   GET /api/feedback/mine
// @access  Private (Citizen)
exports.getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate('complaint', 'category status createdAt');
    res.json({ success: true, data: { feedback } });
  } catch (error) {
    next(error);
  }
};
