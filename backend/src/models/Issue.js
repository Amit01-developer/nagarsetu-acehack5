const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['pothole', 'garbage', 'water_leak', 'street_light', 'drainage', 'other'],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 1000,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Location coordinates are required'],
      },
      address: {
        type: String,
        trim: true,
      },
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    }],
    status: {
      type: String,
      enum: ['pending', 'verified', 'assigned', 'in_progress', 'completed', 'resolved', 'rejected'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // Verification stage
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    // Assignment stage
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignmentDate: {
      type: Date,
    },
    // Completion stage
    resolutionDetails: {
      description: {
        type: String,
      },
      images: [{
        url: String,
        publicId: String,
      }],
      completedDate: {
        type: Date,
      },
    },
    // Resolution review (municipality can reject completed work for rework)
    resolutionRejectionReason: {
      type: String,
    },
    resolutionRejectionDate: {
      type: Date,
    },
    resolutionRejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Points tracking
    pointsAwarded: {
      type: Boolean,
      default: false,
    },
    resolutionPointsAwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location-based queries
issueSchema.index({ location: '2dsphere' });

// Other indexes for common queries
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);
