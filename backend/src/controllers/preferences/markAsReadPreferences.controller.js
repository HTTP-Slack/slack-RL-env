import Preferences from '../../models/preferences/preferences.model.js';
import MarkAsReadPreferences from '../../models/preferences/markAsReadPreferences.model.js';

// @desc    get user's mark as read preferences
// @route   GET /api/preferences/mark-as-read
// @access  Private
export const getMarkAsReadPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get mark as read preferences
    let markAsReadPrefs = null;
    if (userPreferences.markAsRead) {
      markAsReadPrefs = await MarkAsReadPreferences.findById(userPreferences.markAsRead);
    }

    // If mark as read preferences don't exist, return defaults
    if (!markAsReadPrefs) {
      markAsReadPrefs = await MarkAsReadPreferences.create({
        behavior: 'start_where_left',
        promptOnMarkAll: true,
      });
      userPreferences.markAsRead = markAsReadPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: markAsReadPrefs,
    });
  } catch (error) {
    console.log('Error in getMarkAsReadPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's mark as read preferences
// @route   PATCH /api/preferences/mark-as-read
// @access  Private
/*
  body {
    behavior (optional) - 'start_where_left', 'start_newest_mark', 'start_newest_leave',
    promptOnMarkAll (optional)
  }
*/
export const updateMarkAsReadPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum value if behavior is provided
    if (
      updateData.behavior &&
      !['start_where_left', 'start_newest_mark', 'start_newest_leave'].includes(updateData.behavior)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid behavior. Must be one of: start_where_left, start_newest_mark, start_newest_leave',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create mark as read preferences
    let markAsReadPrefs = null;
    if (userPreferences.markAsRead) {
      markAsReadPrefs = await MarkAsReadPreferences.findById(userPreferences.markAsRead);
    }

    if (!markAsReadPrefs) {
      // Create with defaults and merge with update data
      markAsReadPrefs = await MarkAsReadPreferences.create({
        behavior: 'start_where_left',
        promptOnMarkAll: true,
        ...updateData,
      });
      userPreferences.markAsRead = markAsReadPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          markAsReadPrefs[key] = updateData[key];
        }
      });
      await markAsReadPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: markAsReadPrefs,
    });
  } catch (error) {
    console.log('Error in updateMarkAsReadPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create mark as read preferences for user
// @route   POST /api/preferences/mark-as-read
// @access  Private
/*
  body {
    behavior (optional) - 'start_where_left', 'start_newest_mark', 'start_newest_leave',
    promptOnMarkAll (optional)
  }
*/
export const createMarkAsReadPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { behavior, promptOnMarkAll } = req.body;

    // Validate enum value if behavior is provided
    if (behavior && !['start_where_left', 'start_newest_mark', 'start_newest_leave'].includes(behavior)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid behavior. Must be one of: start_where_left, start_newest_mark, start_newest_leave',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if mark as read preferences already exist
    if (userPreferences.markAsRead) {
      return res.status(400).json({
        success: false,
        message: 'Mark as read preferences already exist. Use PATCH to update.',
      });
    }

    // Create mark as read preferences
    const markAsReadPrefs = await MarkAsReadPreferences.create({
      behavior: behavior ?? 'start_where_left',
      promptOnMarkAll: promptOnMarkAll ?? true,
    });

    // Link to user preferences
    userPreferences.markAsRead = markAsReadPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: markAsReadPrefs,
    });
  } catch (error) {
    console.log('Error in createMarkAsReadPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

