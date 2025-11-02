import Preferences from '../../models/preferences/preferences.model.js';
import HomePreferences from '../../models/preferences/homePreferences.model.js';

// @desc    get user's home preferences
// @route   GET /api/preferences/home
// @access  Private
export const getHomePreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get home preferences
    let homePrefs = null;
    if (userPreferences.home) {
      homePrefs = await HomePreferences.findById(userPreferences.home);
    }

    // If home preferences don't exist, return defaults
    if (!homePrefs) {
      homePrefs = await HomePreferences.create({
        showChannelOrganization: true,
        showActivityDot: true,
        alwaysShowUnreads: false,
        alwaysShowHuddles: true,
        alwaysShowThreads: true,
        alwaysShowDraftsSent: true,
        alwaysShowDirectories: true,
        show: 'all',
        sort: 'alphabetically',
        showProfilePhotos: true,
        separatePrivateChannels: false,
        separateDirectMessages: false,
        moveUnreadMentions: true,
        organizeExternalConversations: true,
        displayMutedItems: false,
      });
      userPreferences.home = homePrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: homePrefs,
    });
  } catch (error) {
    console.log('Error in getHomePreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's home preferences
// @route   PATCH /api/preferences/home
// @access  Private
/*
  body {
    showChannelOrganization (optional),
    showActivityDot (optional),
    alwaysShowUnreads (optional),
    alwaysShowHuddles (optional),
    alwaysShowThreads (optional),
    alwaysShowDraftsSent (optional),
    alwaysShowDirectories (optional),
    show (optional) - 'all', 'unreads', 'mentions', 'custom',
    sort (optional) - 'alphabetically', 'most_recent', 'priority',
    showProfilePhotos (optional),
    separatePrivateChannels (optional),
    separateDirectMessages (optional),
    moveUnreadMentions (optional),
    organizeExternalConversations (optional),
    displayMutedItems (optional)
  }
*/
export const updateHomePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum values if provided
    if (updateData.show && !['all', 'unreads', 'mentions', 'custom'].includes(updateData.show)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid show option. Must be one of: all, unreads, mentions, custom',
      });
    }

    if (updateData.sort && !['alphabetically', 'most_recent', 'priority'].includes(updateData.sort)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort option. Must be one of: alphabetically, most_recent, priority',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create home preferences
    let homePrefs = null;
    if (userPreferences.home) {
      homePrefs = await HomePreferences.findById(userPreferences.home);
    }

    if (!homePrefs) {
      // Create with defaults and merge with update data
      homePrefs = await HomePreferences.create({
        showChannelOrganization: true,
        showActivityDot: true,
        alwaysShowUnreads: false,
        alwaysShowHuddles: true,
        alwaysShowThreads: true,
        alwaysShowDraftsSent: true,
        alwaysShowDirectories: true,
        show: 'all',
        sort: 'alphabetically',
        showProfilePhotos: true,
        separatePrivateChannels: false,
        separateDirectMessages: false,
        moveUnreadMentions: true,
        organizeExternalConversations: true,
        displayMutedItems: false,
        ...updateData,
      });
      userPreferences.home = homePrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          homePrefs[key] = updateData[key];
        }
      });
      await homePrefs.save();
    }

    res.status(200).json({
      success: true,
      data: homePrefs,
    });
  } catch (error) {
    console.log('Error in updateHomePreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create home preferences for user
// @route   POST /api/preferences/home
// @access  Private
/*
  body {
    showChannelOrganization (optional),
    showActivityDot (optional),
    alwaysShowUnreads (optional),
    alwaysShowHuddles (optional),
    alwaysShowThreads (optional),
    alwaysShowDraftsSent (optional),
    alwaysShowDirectories (optional),
    show (optional) - 'all', 'unreads', 'mentions', 'custom',
    sort (optional) - 'alphabetically', 'most_recent', 'priority',
    showProfilePhotos (optional),
    separatePrivateChannels (optional),
    separateDirectMessages (optional),
    moveUnreadMentions (optional),
    organizeExternalConversations (optional),
    displayMutedItems (optional)
  }
*/
export const createHomePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum values if provided
    if (updateData.show && !['all', 'unreads', 'mentions', 'custom'].includes(updateData.show)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid show option. Must be one of: all, unreads, mentions, custom',
      });
    }

    if (updateData.sort && !['alphabetically', 'most_recent', 'priority'].includes(updateData.sort)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort option. Must be one of: alphabetically, most_recent, priority',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if home preferences already exist
    if (userPreferences.home) {
      return res.status(400).json({
        success: false,
        message: 'Home preferences already exist. Use PATCH to update.',
      });
    }

    // Create home preferences
    const homePrefs = await HomePreferences.create({
      showChannelOrganization: updateData.showChannelOrganization ?? true,
      showActivityDot: updateData.showActivityDot ?? true,
      alwaysShowUnreads: updateData.alwaysShowUnreads ?? false,
      alwaysShowHuddles: updateData.alwaysShowHuddles ?? true,
      alwaysShowThreads: updateData.alwaysShowThreads ?? true,
      alwaysShowDraftsSent: updateData.alwaysShowDraftsSent ?? true,
      alwaysShowDirectories: updateData.alwaysShowDirectories ?? true,
      show: updateData.show ?? 'all',
      sort: updateData.sort ?? 'alphabetically',
      showProfilePhotos: updateData.showProfilePhotos ?? true,
      separatePrivateChannels: updateData.separatePrivateChannels ?? false,
      separateDirectMessages: updateData.separateDirectMessages ?? false,
      moveUnreadMentions: updateData.moveUnreadMentions ?? true,
      organizeExternalConversations: updateData.organizeExternalConversations ?? true,
      displayMutedItems: updateData.displayMutedItems ?? false,
    });

    // Link to user preferences
    userPreferences.home = homePrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: homePrefs,
    });
  } catch (error) {
    console.log('Error in createHomePreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

