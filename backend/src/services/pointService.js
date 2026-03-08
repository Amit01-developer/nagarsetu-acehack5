const mongoose = require('mongoose');
const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const Issue = require('../models/Issue');

const POINTS = {
  ISSUE_VERIFIED: 10,
  ISSUE_RESOLVED: 20,
};

/**
 * Award points to a citizen for issue verification
 * Uses MongoDB transactions for atomicity
 */
exports.awardVerificationPoints = async (userId, issueId, issue) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return { success: false, message: 'Reporter missing; points not awarded' };
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    return { success: false, message: 'Reporter missing; points not awarded' };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if points already awarded for this issue verification
    if (issue.pointsAwarded) {
      await session.abortTransaction();
      return { success: false, message: 'Points already awarded for verification' };
    }

    // Create points transaction
    await PointsTransaction.create(
      [
        {
          userId,
          issueId,
          points: POINTS.ISSUE_VERIFIED,
          type: 'issue_verified',
          description: `Points for verified issue: ${issue.category}`,
        },
      ],
      { session }
    );

    // Update user's total points
    await User.findByIdAndUpdate(
      userId,
      { $inc: { 'citizen.totalPoints': POINTS.ISSUE_VERIFIED } },
      { session }
    );

    await session.commitTransaction();

    return {
      success: true,
      pointsAwarded: POINTS.ISSUE_VERIFIED,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('Error awarding verification points:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Award points to a citizen for issue resolution
 * Uses MongoDB transactions for atomicity
 */
exports.awardResolutionPoints = async (userId, issueId, issue) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return { success: false, message: 'Reporter missing; points not awarded' };
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    return { success: false, message: 'Reporter missing; points not awarded' };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if resolution points already awarded
    if (issue.resolutionPointsAwarded) {
      await session.abortTransaction();
      return { success: false, message: 'Resolution points already awarded' };
    }

    // Create points transaction
    await PointsTransaction.create(
      [
        {
          userId,
          issueId,
          points: POINTS.ISSUE_RESOLVED,
          type: 'issue_resolved',
          description: `Points for resolved issue: ${issue.category}`,
        },
      ],
      { session }
    );

    // Update user's total points
    await User.findByIdAndUpdate(
      userId,
      { $inc: { 'citizen.totalPoints': POINTS.ISSUE_RESOLVED } },
      { session }
    );

    await session.commitTransaction();

    return {
      success: true,
      pointsAwarded: POINTS.ISSUE_RESOLVED,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('Error awarding resolution points:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get points configuration
 */
exports.getPointsConfig = () => POINTS;

/**
 * Recalculate a user's points and remove orphaned transactions
 * (e.g., when issues were deleted from the database).
 */
exports.reconcileUserPoints = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return { totalPoints: 0, transactions: [] };
  }

  const transactions = await PointsTransaction.find({ userId });
  const issueIds = [...new Set(transactions.map((t) => t.issueId.toString()))];

  // Find existing issues
  const existingIssues = await Issue.find({ _id: { $in: issueIds } }).select('_id');
  const existingSet = new Set(existingIssues.map((i) => i._id.toString()));

  // Remove orphaned transactions
  const orphanIssueIds = issueIds.filter((id) => !existingSet.has(id));
  if (orphanIssueIds.length) {
    await PointsTransaction.deleteMany({ userId, issueId: { $in: orphanIssueIds } });
  }

  // Recompute transactions and total
  const validTransactions = await PointsTransaction.find({ userId }).sort({ createdAt: -1 });
  const totalPoints = validTransactions.reduce((sum, t) => sum + (t.points || 0), 0);

  await User.findByIdAndUpdate(userId, { 'citizen.totalPoints': totalPoints });

  return { totalPoints, transactions: validTransactions };
};
