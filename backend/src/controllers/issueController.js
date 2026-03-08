const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const User = require('../models/User');
const cloudinaryService = require('../services/cloudinaryService');
const pointService = require('../services/pointService');
const notificationService = require('../services/notificationService');

const HOTSPOT_THRESHOLD = 20;
const HOTSPOT_RADIUS_METERS = 300; // ~300m radius considered same area
const DUPLICATE_RADIUS_METERS = 80; // cluster same complaint

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private (Citizen)
exports.createIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { category, description, latitude, longitude, address } = req.body;

    // Upload images to Cloudinary & compute simple hashes for duplicate detection
    const images = [];
    const imageHashes = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinaryService.uploadImage(file.buffer);
        images.push(result);
        const crypto = require('crypto');
        const hash = crypto.createHash('md5').update(file.buffer).digest('hex');
        imageHashes.push(hash);
      }
    }

    // Attempt to find an existing nearby issue to merge into (duplicate detection)
    const nearbyPrimary = await Issue.findOne({
      category,
      status: { $nin: ['resolved', 'rejected'] },
      duplicateOf: null,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: DUPLICATE_RADIUS_METERS,
        },
      },
    })
      .sort({ createdAt: 1 })
      .lean();

    // If we found a likely duplicate based on proximity (and optionally image hash match), attach to it
    let duplicateOfId = null;
    if (nearbyPrimary) {
      if (
        imageHashes.length === 0 ||
        (nearbyPrimary.imageHashes || []).some((h) => imageHashes.includes(h)) ||
        true // always merge on proximity to keep dashboard clean
      ) {
        duplicateOfId = nearbyPrimary._id;
        await Issue.updateOne(
          { _id: nearbyPrimary._id },
          { $inc: { duplicateCount: 1 } }
        );
      }
    }

    const issue = await Issue.create({
      reportedBy: req.user._id,
      category,
      description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address,
      },
      images,
      imageHashes,
      status: 'pending',
      isHotspot: false,
      hotspotCount: 0,
      duplicateOf: duplicateOfId,
    });

    await issue.populate('reportedBy', 'profile.name email');

    // Notify municipalities about the newly reported issue (only for primary issues)
    try {
      if (!issue.duplicateOf) {
        await notificationService.notifyIssueReported(issue);
      }
    } catch (error) {
      console.error('Error notifying municipalities:', error);
    }

    // Detect hotspot clusters (same category within small radius)
    try {
      const nearbyCount = await Issue.countDocuments({
        category,
        status: { $ne: 'rejected' },
        duplicateOf: null,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: HOTSPOT_RADIUS_METERS,
          },
        },
      });

      const crossedThreshold =
        nearbyCount >= HOTSPOT_THRESHOLD && nearbyCount - 1 < HOTSPOT_THRESHOLD;

      // Trigger when threshold reached; keep hotspot flags in sync when above threshold
      if (nearbyCount >= HOTSPOT_THRESHOLD) {
        const radiusInRadians = HOTSPOT_RADIUS_METERS / 6378137; // Earth radius meters
        await Issue.updateMany(
          {
            category,
            status: { $ne: 'rejected' },
            duplicateOf: null,
            location: {
              $geoWithin: {
                $centerSphere: [
                  [parseFloat(longitude), parseFloat(latitude)],
                  radiusInRadians,
                ],
              },
            },
          },
          { isHotspot: true, hotspotCount: nearbyCount }
        );

        issue.isHotspot = true;
        issue.hotspotCount = nearbyCount;
        if (crossedThreshold) {
          await notificationService.notifyHotspotDetected(issue, nearbyCount);
        }
      }
    } catch (error) {
      console.error('Hotspot detection failed:', error);
    }

    res.status(201).json({
      success: true,
      data: { issue },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all issues (filtered by role)
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res, next) => {
  try {
    const {
      status,
      category,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'citizen') {
      query.reportedBy = req.user._id;
    } else if (req.user.role === 'contractor') {
      query.assignedTo = req.user._id;
    }

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reportedBy', 'profile.name email')
        .populate('assignedTo', 'profile.name contractor.company')
        .populate('verifiedBy', 'profile.name')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Issue.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        issues,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Private
exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'profile.name email')
      .populate('assignedTo', 'profile.name contractor.company email')
      .populate('verifiedBy', 'profile.name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    // Check access permissions
    if (req.user.role === 'citizen' && issue.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    if (req.user.role === 'contractor' && issue.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    res.json({
      success: true,
      data: { issue },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby issues
// @route   GET /api/issues/nearby
// @access  Private
exports.getNearbyIssues = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5000, limit = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required.',
      });
    }

    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .populate('reportedBy', 'profile.name')
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { issues },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify an issue (approve/reject)
// @route   PATCH /api/issues/:id/verify
// @access  Private (Municipality)
exports.verifyIssue = async (req, res, next) => {
  try {
    const { approved, rejectionReason, priority } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    if (issue.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending issues can be verified.',
      });
    }

    if (approved) {
      issue.status = 'verified';
      issue.verifiedBy = req.user._id;
      issue.verificationDate = new Date();
      if (priority) {
        issue.priority = priority;
      }

      // Award points to citizen
      const pointsResult = await pointService.awardVerificationPoints(
        issue.reportedBy,
        issue._id,
        issue
      );
      issue.pointsAwarded = pointsResult.success;

      await issue.save();

      // Send notification
      await notificationService.notifyIssueVerified(issue);

      res.json({
        success: true,
        data: {
          issue,
          pointsAwarded: pointsResult.success ? 10 : 0,
        },
      });
    } else {
      issue.status = 'rejected';
      issue.rejectionReason = rejectionReason || 'Not specified';
      issue.verifiedBy = req.user._id;
      issue.verificationDate = new Date();

      await issue.save();

      // Send notification
      await notificationService.notifyIssueRejected(issue);

      res.json({
        success: true,
        data: { issue },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Assign issue to contractor
// @route   PATCH /api/issues/:id/assign
// @access  Private (Municipality)
exports.assignIssue = async (req, res, next) => {
  try {
    const { contractorId } = req.body;

    if (!contractorId) {
      return res.status(400).json({
        success: false,
        message: 'Contractor ID is required.',
      });
    }

    const [issue, contractor] = await Promise.all([
      Issue.findById(req.params.id),
      User.findOne({ _id: contractorId, role: 'contractor', isActive: true }),
    ]);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found.',
      });
    }

    if (issue.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Only verified issues can be assigned.',
      });
    }

    issue.status = 'assigned';
    issue.assignedTo = contractor._id;
    issue.assignmentDate = new Date();

    await issue.save();
    await issue.populate('assignedTo', 'profile.name contractor.company');

    // Send notifications
    await notificationService.notifyIssueAssigned(issue, contractor);

    res.json({
      success: true,
      data: { issue },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status (Contractor)
// @route   PATCH /api/issues/:id/status
// @access  Private (Contractor)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, resolutionDescription } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    // Verify contractor is assigned to this issue
    if (issue.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this issue.',
      });
    }

    // Validate status transitions
    const validTransitions = {
      assigned: ['in_progress'],
      in_progress: ['completed'],
    };

    if (!validTransitions[issue.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${issue.status} to ${status}.`,
      });
    }

    issue.status = status;

    // Handle completion
    if (status === 'completed') {
      // Upload resolution images if provided
      const resolutionImages = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinaryService.uploadImage(
            file.buffer,
            'urbanmind/resolutions'
          );
          resolutionImages.push(result);
        }
      }

      issue.resolutionDetails = {
        description: resolutionDescription || '',
        images: resolutionImages,
        completedDate: new Date(),
      };
      issue.resolutionRejectionReason = undefined;
      issue.resolutionRejectionDate = undefined;
      issue.resolutionRejectedBy = undefined;
    }

    await issue.save();

    // Send notification to citizen
    await notificationService.notifyStatusUpdated(issue, status);

    res.json({
      success: true,
      data: { issue },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve issue (final approval by municipality)
// @route   PATCH /api/issues/:id/resolve
// @access  Private (Municipality)
exports.resolveIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    if (issue.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed issues can be resolved.',
      });
    }

    issue.status = 'resolved';
    issue.resolutionRejectionReason = undefined;
    issue.resolutionRejectionDate = undefined;
    issue.resolutionRejectedBy = undefined;

    // Award resolution points to citizen
    const pointsResult = await pointService.awardResolutionPoints(
      issue.reportedBy,
      issue._id,
      issue
    );
    issue.resolutionPointsAwarded = pointsResult.success;

    await issue.save();

    // Send notification
    await notificationService.notifyIssueResolved(issue);

    res.json({
      success: true,
      data: {
        issue,
        pointsAwarded: pointsResult.success ? 20 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject completed work (request rework)
// @route   PATCH /api/issues/:id/reject-resolution
// @access  Private (Municipality)
exports.rejectResolution = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.',
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    if (issue.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed issues can be rejected for rework.',
      });
    }

    issue.status = 'in_progress';
    issue.resolutionRejectionReason = rejectionReason.trim();
    issue.resolutionRejectionDate = new Date();
    issue.resolutionRejectedBy = req.user._id;

    await issue.save();

    // Send notifications
    await notificationService.notifyResolutionRejected(issue, issue.resolutionRejectionReason);

    res.json({
      success: true,
      data: { issue },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue (only pending issues by owner)
// @route   DELETE /api/issues/:id
// @access  Private (Citizen - own issues only)
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    // Only owner can delete
    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own issues.',
      });
    }

    // Only pending issues can be deleted
    if (issue.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending issues can be deleted.',
      });
    }

    // Delete images from Cloudinary
    if (issue.images?.length > 0) {
      const publicIds = issue.images.map((img) => img.publicId);
      await cloudinaryService.deleteMultipleImages(publicIds);
    }

    await issue.deleteOne();

    res.json({
      success: true,
      message: 'Issue deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
