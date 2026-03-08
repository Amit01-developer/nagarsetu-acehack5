const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    qualityRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    speedRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ complaint: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
