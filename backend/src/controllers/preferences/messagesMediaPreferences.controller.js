import Preferences from '../../models/preferences/preferences.model.js';
import MessagesMediaPreferences from '../../models/preferences/messagesMediaPreferences.model.js';

// @desc    get user's messages & media preferences
// @route   GET /api/preferences/messages-media
// @access  Private
export const getMessagesMediaPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get messages & media preferences
    let messagesMediaPrefs = null;
    if (userPreferences.messagesMedia) {
      messagesMediaPrefs = await MessagesMediaPreferences.findById(userPreferences.messagesMedia);
    }

    // If messages & media preferences don't exist, return defaults
    if (!messagesMediaPrefs) {
      messagesMediaPrefs = await MessagesMediaPreferences.create({
        showImagesFiles: true,
        showImagesLinked: true,
        showImagesLarge: false,
        showTextPreviews: true,
      });
      userPreferences.messagesMedia = messagesMediaPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: messagesMediaPrefs,
    });
  } catch (error) {
    console.log('Error in getMessagesMediaPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's messages & media preferences
// @route   PATCH /api/preferences/messages-media
// @access  Private
/*
  body {
    showImagesFiles (optional),
    showImagesLinked (optional),
    showImagesLarge (optional),
    showTextPreviews (optional)
  }
*/
export const updateMessagesMediaPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create messages & media preferences
    let messagesMediaPrefs = null;
    if (userPreferences.messagesMedia) {
      messagesMediaPrefs = await MessagesMediaPreferences.findById(userPreferences.messagesMedia);
    }

    if (!messagesMediaPrefs) {
      // Create with defaults and merge with update data
      messagesMediaPrefs = await MessagesMediaPreferences.create({
        showImagesFiles: true,
        showImagesLinked: true,
        showImagesLarge: false,
        showTextPreviews: true,
        ...updateData,
      });
      userPreferences.messagesMedia = messagesMediaPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          messagesMediaPrefs[key] = updateData[key];
        }
      });
      await messagesMediaPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: messagesMediaPrefs,
    });
  } catch (error) {
    console.log('Error in updateMessagesMediaPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create messages & media preferences for user
// @route   POST /api/preferences/messages-media
// @access  Private
/*
  body {
    showImagesFiles (optional),
    showImagesLinked (optional),
    showImagesLarge (optional),
    showTextPreviews (optional)
  }
*/
export const createMessagesMediaPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { showImagesFiles, showImagesLinked, showImagesLarge, showTextPreviews } = req.body;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if messages & media preferences already exist
    if (userPreferences.messagesMedia) {
      return res.status(400).json({
        success: false,
        message: 'Messages & media preferences already exist. Use PATCH to update.',
      });
    }

    // Create messages & media preferences
    const messagesMediaPrefs = await MessagesMediaPreferences.create({
      showImagesFiles: showImagesFiles ?? true,
      showImagesLinked: showImagesLinked ?? true,
      showImagesLarge: showImagesLarge ?? false,
      showTextPreviews: showTextPreviews ?? true,
    });

    // Link to user preferences
    userPreferences.messagesMedia = messagesMediaPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: messagesMediaPrefs,
    });
  } catch (error) {
    console.log('Error in createMessagesMediaPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

