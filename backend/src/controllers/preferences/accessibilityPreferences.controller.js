import Preferences from '../../models/preferences/preferences.model.js';
import AccessibilityPreferences from '../../models/preferences/accessibilityPreferences.model.js';

// @desc    get user's accessibility preferences
// @route   GET /api/preferences/accessibility
// @access  Private
export const getAccessibilityPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get accessibility preferences
    let accessibilityPrefs = null;
    if (userPreferences.accessibility) {
      accessibilityPrefs = await AccessibilityPreferences.findById(userPreferences.accessibility);
    }

    // If accessibility preferences don't exist, return defaults
    if (!accessibilityPrefs) {
      accessibilityPrefs = await AccessibilityPreferences.create({
        simplifiedLayoutMode: false,
        underlineLinks: false,
        tabPreviews: true,
        autoPlayAnimations: true,
        messageFormat: 'sender_message_date',
        announceIncomingMessages: true,
        readEmojiReactions: true,
        playEmojiSound: true,
      });
      userPreferences.accessibility = accessibilityPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: accessibilityPrefs,
    });
  } catch (error) {
    console.log('Error in getAccessibilityPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's accessibility preferences
// @route   PATCH /api/preferences/accessibility
// @access  Private
/*
  body {
    simplifiedLayoutMode (optional),
    underlineLinks (optional),
    tabPreviews (optional),
    autoPlayAnimations (optional),
    messageFormat (optional) - 'sender_message_date' or 'sender_date_message',
    announceIncomingMessages (optional),
    readEmojiReactions (optional),
    playEmojiSound (optional)
  }
*/
export const updateAccessibilityPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum value if messageFormat is provided
    if (
      updateData.messageFormat &&
      !['sender_message_date', 'sender_date_message'].includes(updateData.messageFormat)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid message format. Must be one of: sender_message_date, sender_date_message',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create accessibility preferences
    let accessibilityPrefs = null;
    if (userPreferences.accessibility) {
      accessibilityPrefs = await AccessibilityPreferences.findById(userPreferences.accessibility);
    }

    if (!accessibilityPrefs) {
      // Create with defaults and merge with update data
      accessibilityPrefs = await AccessibilityPreferences.create({
        simplifiedLayoutMode: false,
        underlineLinks: false,
        tabPreviews: true,
        autoPlayAnimations: true,
        messageFormat: 'sender_message_date',
        announceIncomingMessages: true,
        readEmojiReactions: true,
        playEmojiSound: true,
        ...updateData,
      });
      userPreferences.accessibility = accessibilityPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          accessibilityPrefs[key] = updateData[key];
        }
      });
      await accessibilityPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: accessibilityPrefs,
    });
  } catch (error) {
    console.log('Error in updateAccessibilityPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create accessibility preferences for user
// @route   POST /api/preferences/accessibility
// @access  Private
/*
  body {
    simplifiedLayoutMode (optional),
    underlineLinks (optional),
    tabPreviews (optional),
    autoPlayAnimations (optional),
    messageFormat (optional) - 'sender_message_date' or 'sender_date_message',
    announceIncomingMessages (optional),
    readEmojiReactions (optional),
    playEmojiSound (optional)
  }
*/
export const createAccessibilityPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum value if messageFormat is provided
    if (
      updateData.messageFormat &&
      !['sender_message_date', 'sender_date_message'].includes(updateData.messageFormat)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid message format. Must be one of: sender_message_date, sender_date_message',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if accessibility preferences already exist
    if (userPreferences.accessibility) {
      return res.status(400).json({
        success: false,
        message: 'Accessibility preferences already exist. Use PATCH to update.',
      });
    }

    // Create accessibility preferences
    const accessibilityPrefs = await AccessibilityPreferences.create({
      simplifiedLayoutMode: updateData.simplifiedLayoutMode ?? false,
      underlineLinks: updateData.underlineLinks ?? false,
      tabPreviews: updateData.tabPreviews ?? true,
      autoPlayAnimations: updateData.autoPlayAnimations ?? true,
      messageFormat: updateData.messageFormat ?? 'sender_message_date',
      announceIncomingMessages: updateData.announceIncomingMessages ?? true,
      readEmojiReactions: updateData.readEmojiReactions ?? true,
      playEmojiSound: updateData.playEmojiSound ?? true,
    });

    // Link to user preferences
    userPreferences.accessibility = accessibilityPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: accessibilityPrefs,
    });
  } catch (error) {
    console.log('Error in createAccessibilityPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

