const { validationResult } = require('express-validator');
const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const pointService = require('../services/pointService');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { profile } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile: { ...req.user.profile, ...profile } } },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user points and transactions (Citizen only)
// @route   GET /api/users/points
// @access  Private (Citizen)
exports.getPoints = async (req, res, next) => {
  try {
    const { totalPoints, transactions } = await pointService.reconcileUserPoints(req.user._id);

    const limited = transactions
      .slice(0, 50)
      .map((t) => t)
      .reverse()
      .reverse(); // no-op, keep order; kept slice for potential future transforms

    await PointsTransaction.populate(limited, {
      path: 'issueId',
      select: 'category description',
    });

    res.json({
      success: true,
      data: {
        totalPoints,
        transactions: limited,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contractors (Municipality only)
// @route   GET /api/users/contractors
// @access  Private (Municipality)
exports.getContractors = async (req, res, next) => {
  try {
    const { specialization, company } = req.query;

    const query = { role: 'contractor', isActive: true };

    if (specialization) {
      query['contractor.specialization'] = specialization;
    }

    if (company) {
      if (company === 'independent') {
        // Contractors without a company
        query['$or'] = [
          { 'contractor.company': null },
          { 'contractor.company': '' },
          { 'contractor.company': { $exists: false } },
        ];
      } else {
        // Case-insensitive company match
        query['contractor.company'] = new RegExp(`^${company}$`, 'i');
      }
    }

    const contractors = await User.find(query).select(
      'profile contractor email'
    );

    res.json({
      success: true,
      data: { contractors },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique company names from contractors (Municipality only)
// @route   GET /api/users/contractors/companies
// @access  Private (Municipality)
exports.getContractorCompanies = async (req, res, next) => {
  try {
    const companies = await User.aggregate([
      { $match: { role: 'contractor', isActive: true } },
      { $group: { _id: '$contractor.company' } },
      { $match: { _id: { $ne: null, $ne: '' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { companies: companies.map((c) => c._id).filter(Boolean) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register device token for push notifications
// @route   POST /api/users/device-token
// @access  Private
exports.registerDeviceToken = async (req, res, next) => {
  try {
    const { deviceToken } = req.body;

    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required.',
      });
    }

    // Add token if not already present
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { deviceTokens: deviceToken },
    });

    res.json({
      success: true,
      message: 'Device token registered successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard (top citizens by points)
// @route   GET /api/users/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await User.find({ role: 'citizen' })
      .sort({ 'citizen.totalPoints': -1 })
      .limit(parseInt(limit))
      .select('profile.name citizen.totalPoints');

    res.json({
      success: true,
      data: { leaderboard },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile with recent activity (Citizen only)
// @route   GET /api/users/profile-full
// @access  Private (Citizen)
exports.getProfileFull = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const transactions = await PointsTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('issueId', 'category description');

    res.json({
      success: true,
      data: {
        user,
        recentTransactions: transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};
