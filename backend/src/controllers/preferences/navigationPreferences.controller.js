import Preferences from '../../models/preferences/preferences.model.js';
import NavigationPreferences from '../../models/preferences/navigationPreferences.model.js';

// @desc    get user's navigation preferences
// @route   GET /api/navigation-preferences
// @access  Private
export const getNavigationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get navigation preferences
    let navigationPrefs = null;
    if (userPreferences.navigation) {
      navigationPrefs = await NavigationPreferences.findById(userPreferences.navigation);
    }

    // If navigation preferences don't exist, return defaults
    if (!navigationPrefs) {
      navigationPrefs = await NavigationPreferences.create({
        showHome: true,
        showDMs: true,
        showActivity: true,
        showFiles: true,
        showTools: false,
        tabAppearance: 'icons_text',
      });
      userPreferences.navigation = navigationPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: navigationPrefs,
    });
  } catch (error) {
    console.log('Error in getNavigationPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's navigation preferences
// @route   PATCH /api/navigation-preferences
// @access  Private
/*
  body {
    showHome (optional),
    showDMs (optional),
    showActivity (optional),
    showFiles (optional),
    showTools (optional),
    tabAppearance (optional) - 'icons_text' or 'icons_only'
  }
*/
export const updateNavigationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum value if tabAppearance is provided
    if (updateData.tabAppearance && !['icons_text', 'icons_only'].includes(updateData.tabAppearance)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tab appearance. Must be one of: icons_text, icons_only',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create navigation preferences
    let navigationPrefs = null;
    if (userPreferences.navigation) {
      navigationPrefs = await NavigationPreferences.findById(userPreferences.navigation);
    }

    if (!navigationPrefs) {
      // Create with defaults and merge with update data
      navigationPrefs = await NavigationPreferences.create({
        showHome: true,
        showDMs: true,
        showActivity: true,
        showFiles: true,
        showTools: false,
        tabAppearance: 'icons_text',
        ...updateData,
      });
      userPreferences.navigation = navigationPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          navigationPrefs[key] = updateData[key];
        }
      });
      await navigationPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: navigationPrefs,
    });
  } catch (error) {
    console.log('Error in updateNavigationPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create navigation preferences for user
// @route   POST /api/navigation-preferences
// @access  Private
/*
  body {
    showHome (optional),
    showDMs (optional),
    showActivity (optional),
    showFiles (optional),
    showTools (optional),
    tabAppearance (optional) - 'icons_text' or 'icons_only'
  }
*/
export const createNavigationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { showHome, showDMs, showActivity, showFiles, showTools, tabAppearance } = req.body;

    // Validate enum value if tabAppearance is provided
    if (tabAppearance && !['icons_text', 'icons_only'].includes(tabAppearance)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tab appearance. Must be one of: icons_text, icons_only',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if navigation preferences already exist
    if (userPreferences.navigation) {
      return res.status(400).json({
        success: false,
        message: 'Navigation preferences already exist. Use PATCH to update.',
      });
    }

    // Create navigation preferences
    const navigationPrefs = await NavigationPreferences.create({
      showHome: showHome ?? true,
      showDMs: showDMs ?? true,
      showActivity: showActivity ?? true,
      showFiles: showFiles ?? true,
      showTools: showTools ?? false,
      tabAppearance: tabAppearance ?? 'icons_text',
    });

    // Link to user preferences
    userPreferences.navigation = navigationPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: navigationPrefs,
    });
  } catch (error) {
    console.log('Error in createNavigationPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

