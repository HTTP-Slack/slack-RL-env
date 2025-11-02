import Preferences from '../../models/preferences/preferences.model.js';
import NotificationPreferences from '../../models/preferences/notificationPreferences.model.js';

// @desc    get user's notification preferences
// @route   GET /api/notification-preferences
// @access  Private
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get notification preferences
    let notificationPrefs = null;
    if (userPreferences.notifications) {
      notificationPrefs = await NotificationPreferences.findById(userPreferences.notifications);
    }

    // If notification preferences don't exist, return defaults
    if (!notificationPrefs) {
      notificationPrefs = await NotificationPreferences.create({
        type: 'all',
        differentMobileSettings: false,
        huddles: true,
        threadReplies: true,
        keywords: '',
      });
      userPreferences.notifications = notificationPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: notificationPrefs,
    });
  } catch (error) {
    console.log('Error in getNotificationPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's notification preferences
// @route   PATCH /api/notification-preferences
// @access  Private
/*
  body {
    type (optional),
    differentMobileSettings (optional),
    huddles (optional),
    threadReplies (optional),
    keywords (optional)
  }
*/
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum value if type is provided
    if (updateData.type && !['all', 'direct_mentions_keywords', 'nothing'].includes(updateData.type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type. Must be one of: all, direct_mentions_keywords, nothing',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create notification preferences
    let notificationPrefs = null;
    if (userPreferences.notifications) {
      notificationPrefs = await NotificationPreferences.findById(userPreferences.notifications);
    }

    if (!notificationPrefs) {
      // Create with defaults and merge with update data
      notificationPrefs = await NotificationPreferences.create({
        type: 'all',
        differentMobileSettings: false,
        huddles: true,
        threadReplies: true,
        keywords: '',
        ...updateData,
      });
      userPreferences.notifications = notificationPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          notificationPrefs[key] = updateData[key];
        }
      });
      await notificationPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: notificationPrefs,
    });
  } catch (error) {
    console.log('Error in updateNotificationPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create notification preferences for user
// @route   POST /api/notification-preferences
// @access  Private
/*
  body {
    type (required),
    differentMobileSettings (optional),
    huddles (optional),
    threadReplies (optional),
    keywords (optional)
  }
*/
export const createNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, differentMobileSettings, huddles, threadReplies, keywords } = req.body;

    // Validate required fields
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Notification type is required',
      });
    }

    // Validate enum value
    if (!['all', 'direct_mentions_keywords', 'nothing'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type. Must be one of: all, direct_mentions_keywords, nothing',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if notification preferences already exist
    if (userPreferences.notifications) {
      return res.status(400).json({
        success: false,
        message: 'Notification preferences already exist. Use PATCH to update.',
      });
    }

    // Create notification preferences
    const notificationPrefs = await NotificationPreferences.create({
      type,
      differentMobileSettings: differentMobileSettings ?? false,
      huddles: huddles ?? true,
      threadReplies: threadReplies ?? true,
      keywords: keywords ?? '',
    });

    // Link to user preferences
    userPreferences.notifications = notificationPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: notificationPrefs,
    });
  } catch (error) {
    console.log('Error in createNotificationPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

