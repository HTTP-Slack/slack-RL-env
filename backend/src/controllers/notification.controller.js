import Notification from '../models/notification.model.js';

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
// @queries ?organisation, ?isRead, ?limit, ?skip
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { organisation, isRead, limit = 50, skip = 0 } = req.query;

    const query = { user: userId };

    if (organisation) {
      query.organisation = organisation;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username email')
      .populate('message', 'content')
      .populate('channel', 'name')
      .populate('conversation')
      .populate('organisation', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      total: totalCount,
      unread: unreadCount,
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
// @queries ?organisation
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { organisation } = req.query;

    const query = { user: userId, isRead: false };

    if (organisation) {
      query.organisation = organisation;
    }

    const count = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    )
      .populate('sender', 'username email')
      .populate('message', 'content')
      .populate('channel', 'name')
      .populate('conversation')
      .populate('organisation', 'name');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
// @queries ?organisation
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { organisation } = req.query;

    const query = { user: userId, isRead: false };

    if (organisation) {
      query.organisation = organisation;
    }

    const result = await Notification.updateMany(query, { isRead: true });

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
// @queries ?organisation, ?isRead
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { organisation, isRead } = req.query;

    const query = { user: userId };

    if (organisation) {
      query.organisation = organisation;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const result = await Notification.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} notifications`,
      count: result.deletedCount,
    });
  } catch (error) {
    console.error('Error in deleteAllNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

