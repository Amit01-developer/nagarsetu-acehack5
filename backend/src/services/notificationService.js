const Notification = require('../models/Notification');
const User = require('../models/User');

// OneSignal client - will be initialized if credentials exist
let oneSignalClient = null;

try {
  if (process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY) {
    oneSignalClient = require('../config/onesignal');
  }
} catch (error) {
  console.log('OneSignal not configured - push notifications disabled');
}

/**
 * Create notification and optionally send push notification
 */
const createNotification = async ({
  userId,
  issueId,
  type,
  title,
  message,
  data = {},
}) => {
  try {
    if (!userId) {
      console.warn('Skipping notification: missing userId', { type, issueId });
      return { notification: null, sentViaOneSignal: false };
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      console.warn('Skipping notification: user not found', { userId, type, issueId });
      return { notification: null, sentViaOneSignal: false };
    }

    // Create notification in database
    const notification = await Notification.create({
      userId,
      issueId,
      type,
      title,
      message,
      data,
    });

    // Send push notification if OneSignal is configured
    let sentViaOneSignal = false;
    if (oneSignalClient) {
      sentViaOneSignal = await sendPushNotification(userId, title, message, data);
      if (sentViaOneSignal) {
        notification.sentViaOneSignal = true;
        await notification.save();
      }
    }

    return { notification, sentViaOneSignal };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { notification: null, sentViaOneSignal: false };
  }
};

const notifyMunicipalities = async ({ issueId, type, title, message, data = {} }) => {
  try {
    const municipalities = await User.find({ role: 'municipality', isActive: true }).select('_id');
    await Promise.allSettled(
      municipalities.map((m) =>
        createNotification({
          userId: m._id,
          issueId,
          type,
          title,
          message,
          data,
        })
      )
    );
  } catch (error) {
    console.error('Error notifying municipalities:', error);
  }
};

/**
 * Send push notification via OneSignal
 */
const sendPushNotification = async (userId, title, message, data = {}) => {
  if (!oneSignalClient) return false;

  try {
    const user = await User.findById(userId);
    
    if (!user?.deviceTokens?.length) {
      return false;
    }

    const notificationPayload = {
      contents: { en: message },
      headings: { en: title },
      include_player_ids: user.deviceTokens,
      data,
    };

    await oneSignalClient.createNotification(notificationPayload);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Notification types and their messages
 */
const notifyIssueReported = async (issue) => {
  return notifyMunicipalities({
    issueId: issue._id,
    type: 'issue_reported',
    title: 'New Issue Reported',
    message: `New ${issue.category.replace('_', ' ')} issue reported. Please review and verify.`,
    data: { issueId: issue._id.toString(), status: issue.status || 'pending' },
  });
};

const notifyIssueVerified = async (issue) => {
  await createNotification({
    userId: issue.reportedBy,
    issueId: issue._id,
    type: 'issue_verified',
    title: 'Issue Verified',
    message: `Your reported ${issue.category.replace('_', ' ')} issue has been verified. You earned 10 points!`,
    data: { issueId: issue._id.toString(), status: 'verified' },
  });

  if (issue.assignedTo) {
    await createNotification({
      userId: issue.assignedTo,
      issueId: issue._id,
      type: 'issue_verified',
      title: 'Issue Verified',
      message: `An issue assigned to you has been verified by the municipality.`,
      data: { issueId: issue._id.toString(), status: 'verified' },
    });
  }
};

const notifyIssueRejected = async (issue) => {
  return createNotification({
    userId: issue.reportedBy,
    issueId: issue._id,
    type: 'issue_rejected',
    title: 'Issue Rejected',
    message: `Your reported issue was rejected. Reason: ${issue.rejectionReason || 'Not specified'}`,
    data: { issueId: issue._id.toString(), status: 'rejected' },
  });
};

const notifyIssueAssigned = async (issue, contractor) => {
  // Notify citizen
  await createNotification({
    userId: issue.reportedBy,
    issueId: issue._id,
    type: 'issue_assigned',
    title: 'Issue Assigned',
    message: `Your ${issue.category.replace('_', ' ')} issue has been assigned to a contractor.`,
    data: { issueId: issue._id.toString(), status: 'assigned' },
  });

  // Notify municipalities
  await notifyMunicipalities({
    issueId: issue._id,
    type: 'issue_assigned',
    title: 'Issue Assigned',
    message: `A ${issue.category.replace('_', ' ')} issue was assigned to ${contractor.profile?.name || 'a contractor'}.`,
    data: {
      issueId: issue._id.toString(),
      status: 'assigned',
      contractorId: contractor._id.toString(),
    },
  });

  // Notify contractor
  return createNotification({
    userId: contractor._id,
    issueId: issue._id,
    type: 'work_assigned',
    title: 'New Work Order',
    message: `You have been assigned a new ${issue.category.replace('_', ' ')} issue to resolve.`,
    data: { issueId: issue._id.toString(), status: 'assigned' },
  });
};

const notifyStatusUpdated = async (issue, newStatus) => {
  const statusMessages = {
    in_progress: 'Work has started on your reported issue.',
    completed: 'The contractor has completed work on your issue. Awaiting final approval.',
  };

  await createNotification({
    userId: issue.reportedBy,
    issueId: issue._id,
    type: 'status_updated',
    title: 'Issue Status Updated',
    message: statusMessages[newStatus] || `Your issue status has been updated to ${newStatus}.`,
    data: { issueId: issue._id.toString(), status: newStatus },
  });

  if (newStatus === 'completed') {
    await notifyMunicipalities({
      issueId: issue._id,
      type: 'issue_completed',
      title: 'Issue Completed',
      message: `A contractor marked a ${issue.category.replace('_', ' ')} issue as completed. Please review and approve.`,
      data: { issueId: issue._id.toString(), status: 'completed' },
    });
  }
};

const notifyIssueResolved = async (issue) => {
  await createNotification({
    userId: issue.reportedBy,
    issueId: issue._id,
    type: 'issue_resolved',
    title: 'Issue Resolved',
    message: `Great news! Your ${issue.category.replace('_', ' ')} issue has been resolved. You earned 20 points!`,
    data: { issueId: issue._id.toString(), status: 'resolved' },
  });

  if (issue.assignedTo) {
    await createNotification({
      userId: issue.assignedTo,
      issueId: issue._id,
      type: 'issue_resolved',
      title: 'Issue Approved',
      message: `The municipality approved your completed work. The issue is now resolved.`,
      data: { issueId: issue._id.toString(), status: 'resolved' },
    });
  }
};

const notifyResolutionRejected = async (issue, rejectionReason) => {
  const reasonText = rejectionReason || issue.resolutionRejectionReason || 'Not specified';

  // Per product requirement: only the contractor is notified to rework.
  if (!issue.assignedTo) return;

  await createNotification({
    userId: issue.assignedTo,
    issueId: issue._id,
    type: 'resolution_rejected',
    title: 'Work Rejected',
    message: `The municipality rejected your completed work. Reason: ${reasonText}`,
    data: { issueId: issue._id.toString(), status: issue.status || 'in_progress' },
  });
};

module.exports = {
  createNotification,
  sendPushNotification,
  notifyIssueReported,
  notifyIssueVerified,
  notifyIssueRejected,
  notifyIssueAssigned,
  notifyStatusUpdated,
  notifyIssueResolved,
  notifyResolutionRejected,
};
