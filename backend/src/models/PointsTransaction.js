const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['issue_verified', 'issue_resolved'],
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
pointsTransactionSchema.index({ userId: 1 });
pointsTransactionSchema.index({ issueId: 1 });
pointsTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PointsTransaction', pointsTransactionSchema);
