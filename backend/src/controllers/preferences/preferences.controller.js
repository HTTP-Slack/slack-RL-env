import Preferences from '../../models/preferences/preferences.model.js';
import NotificationPreferences from '../../models/preferences/notificationPreferences.model.js';
import VIPPreferences from '../../models/preferences/vipPreferences.model.js';
import NavigationPreferences from '../../models/preferences/navigationPreferences.model.js';
import HomePreferences from '../../models/preferences/homePreferences.model.js';

// @desc    get user's complete preferences
// @route   GET /api/preferences
// @access  Private
export const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await Preferences.findOne({ user: userId })
      .populate('notifications')
      .populate('vip')
      .populate('navigation')
      .populate('home')
      .populate('appearance')
      .populate('messagesMedia')
      .populate('languageRegion')
      .populate('accessibility')
      .populate('markAsRead')
      .populate('audioVideo')
      .populate('privacyVisibility')
      .populate('slackAI')
      .populate('advanced');

    // If preferences don't exist, create them with defaults
    if (!preferences) {
      preferences = await Preferences.create({ user: userId });
      preferences = await Preferences.findById(preferences._id)
        .populate('notifications')
        .populate('vip')
        .populate('navigation')
        .populate('home')
        .populate('appearance')
        .populate('messagesMedia')
        .populate('languageRegion')
        .populate('accessibility')
        .populate('markAsRead')
        .populate('audioVideo')
        .populate('privacyVisibility')
        .populate('slackAI')
        .populate('advanced');
    }

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.log('Error in getPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's preferences
// @route   PATCH /api/preferences
// @access  Private
/*
  body {
    notifications: { ... } (optional),
    vip: { ... } (optional),
    ... (other preference categories)
  }
*/
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    let preferences = await Preferences.findOne({ user: userId });

    if (!preferences) {
      preferences = await Preferences.create({ user: userId });
    }

    // Handle notifications update
    if (updateData.notifications) {
      if (preferences.notifications) {
        await NotificationPreferences.findByIdAndUpdate(
          preferences.notifications,
          updateData.notifications,
          { new: true }
        );
      } else {
        const notificationPrefs = await NotificationPreferences.create(updateData.notifications);
        preferences.notifications = notificationPrefs._id;
        await preferences.save();
      }
    }

    // Handle VIP update
    if (updateData.vip) {
      if (preferences.vip) {
        await VIPPreferences.findByIdAndUpdate(
          preferences.vip,
          updateData.vip,
          { new: true }
        );
      } else {
        const vipPrefs = await VIPPreferences.create(updateData.vip);
        preferences.vip = vipPrefs._id;
        await preferences.save();
      }
    }

    // Handle navigation update
    if (updateData.navigation) {
      if (preferences.navigation) {
        await NavigationPreferences.findByIdAndUpdate(
          preferences.navigation,
          updateData.navigation,
          { new: true }
        );
      } else {
        const navigationPrefs = await NavigationPreferences.create(updateData.navigation);
        preferences.navigation = navigationPrefs._id;
        await preferences.save();
      }
    }

    // Handle home update
    if (updateData.home) {
      if (preferences.home) {
        await HomePreferences.findByIdAndUpdate(
          preferences.home,
          updateData.home,
          { new: true }
        );
      } else {
        const homePrefs = await HomePreferences.create(updateData.home);
        preferences.home = homePrefs._id;
        await preferences.save();
      }
    }

    // TODO: Handle other preference categories as they are implemented
    // Similar pattern for appearance, messagesMedia, etc.

    // Reload preferences with populated fields
    preferences = await Preferences.findById(preferences._id)
      .populate('notifications')
      .populate('vip')
      .populate('navigation')
      .populate('home')
      .populate('appearance')
      .populate('messagesMedia')
      .populate('languageRegion')
      .populate('accessibility')
      .populate('markAsRead')
      .populate('audioVideo')
      .populate('privacyVisibility')
      .populate('slackAI')
      .populate('advanced');

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.log('Error in updatePreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create initial preferences for user
// @route   POST /api/preferences
// @access  Private
export const createPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if preferences already exist
    const existingPreferences = await Preferences.findOne({ user: userId });
    if (existingPreferences) {
      return res.status(400).json({
        success: false,
        message: 'Preferences already exist for this user',
      });
    }

    const preferences = await Preferences.create({ user: userId });

    const populatedPreferences = await Preferences.findById(preferences._id)
      .populate('notifications')
      .populate('vip')
      .populate('navigation')
      .populate('home')
      .populate('appearance')
      .populate('messagesMedia')
      .populate('languageRegion')
      .populate('accessibility')
      .populate('markAsRead')
      .populate('audioVideo')
      .populate('privacyVisibility')
      .populate('slackAI')
      .populate('advanced');

    res.status(201).json({
      success: true,
      data: populatedPreferences,
    });
  } catch (error) {
    console.log('Error in createPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

