import Preferences from '../../models/preferences/preferences.model.js';
import AdvancedPreferences from '../../models/preferences/advancedPreferences.model.js';

// @desc    get user's advanced preferences
// @route   GET /api/preferences/advanced
// @access  Private
export const getAdvancedPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get advanced preferences
    let advancedPrefs = null;
    if (userPreferences.advanced) {
      advancedPrefs = await AdvancedPreferences.findById(userPreferences.advanced);
    }

    // If advanced preferences don't exist, return defaults
    if (!advancedPrefs) {
      advancedPrefs = await AdvancedPreferences.create({
        whenTypingCodeEnterShouldNotSend: false,
        formatMessagesWithMarkup: false,
        enterBehavior: 'send',
        ctrlFStartsSearch: false,
        searchShortcut: 'cmd_k',
        excludeChannelsFromSearch: [],
        searchSortDefault: 'most_relevant',
        confirmUnsend: true,
        confirmAwayToggle: true,
        warnMaliciousLinks: true,
        warnExternalFiles: true,
        warnExternalCanvases: true,
        channelSuggestions: true,
        surveys: true,
      });
      userPreferences.advanced = advancedPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: advancedPrefs,
    });
  } catch (error) {
    console.log('Error in getAdvancedPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's advanced preferences
// @route   PATCH /api/preferences/advanced
// @access  Private
/*
  body {
    whenTypingCodeEnterShouldNotSend (optional),
    formatMessagesWithMarkup (optional),
    enterBehavior (optional) - 'send', 'newline',
    ctrlFStartsSearch (optional),
    searchShortcut (optional) - 'cmd_f', 'cmd_k',
    excludeChannelsFromSearch (optional) - array of strings,
    searchSortDefault (optional) - 'most_relevant', 'last_used',
    confirmUnsend (optional),
    confirmAwayToggle (optional),
    warnMaliciousLinks (optional),
    warnExternalFiles (optional),
    warnExternalCanvases (optional),
    channelSuggestions (optional),
    surveys (optional)
  }
*/
export const updateAdvancedPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum values if provided
    if (updateData.enterBehavior && !['send', 'newline'].includes(updateData.enterBehavior)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enterBehavior. Must be one of: send, newline',
      });
    }

    if (updateData.searchShortcut && !['cmd_f', 'cmd_k'].includes(updateData.searchShortcut)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid searchShortcut. Must be one of: cmd_f, cmd_k',
      });
    }

    if (
      updateData.searchSortDefault &&
      !['most_relevant', 'last_used'].includes(updateData.searchSortDefault)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid searchSortDefault. Must be one of: most_relevant, last_used',
      });
    }

    // Validate excludeChannelsFromSearch is an array if provided
    if (
      updateData.excludeChannelsFromSearch !== undefined &&
      !Array.isArray(updateData.excludeChannelsFromSearch)
    ) {
      return res.status(400).json({
        success: false,
        message: 'excludeChannelsFromSearch must be an array',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create advanced preferences
    let advancedPrefs = null;
    if (userPreferences.advanced) {
      advancedPrefs = await AdvancedPreferences.findById(userPreferences.advanced);
    }

    if (!advancedPrefs) {
      // Create with defaults and merge with update data
      advancedPrefs = await AdvancedPreferences.create({
        whenTypingCodeEnterShouldNotSend: false,
        formatMessagesWithMarkup: false,
        enterBehavior: 'send',
        ctrlFStartsSearch: false,
        searchShortcut: 'cmd_k',
        excludeChannelsFromSearch: [],
        searchSortDefault: 'most_relevant',
        confirmUnsend: true,
        confirmAwayToggle: true,
        warnMaliciousLinks: true,
        warnExternalFiles: true,
        warnExternalCanvases: true,
        channelSuggestions: true,
        surveys: true,
        ...updateData,
      });
      userPreferences.advanced = advancedPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          advancedPrefs[key] = updateData[key];
        }
      });
      await advancedPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: advancedPrefs,
    });
  } catch (error) {
    console.log('Error in updateAdvancedPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create advanced preferences for user
// @route   POST /api/preferences/advanced
// @access  Private
/*
  body {
    whenTypingCodeEnterShouldNotSend (optional),
    formatMessagesWithMarkup (optional),
    enterBehavior (optional) - 'send', 'newline',
    ctrlFStartsSearch (optional),
    searchShortcut (optional) - 'cmd_f', 'cmd_k',
    excludeChannelsFromSearch (optional) - array of strings,
    searchSortDefault (optional) - 'most_relevant', 'last_used',
    confirmUnsend (optional),
    confirmAwayToggle (optional),
    warnMaliciousLinks (optional),
    warnExternalFiles (optional),
    warnExternalCanvases (optional),
    channelSuggestions (optional),
    surveys (optional)
  }
*/
export const createAdvancedPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      whenTypingCodeEnterShouldNotSend,
      formatMessagesWithMarkup,
      enterBehavior,
      ctrlFStartsSearch,
      searchShortcut,
      excludeChannelsFromSearch,
      searchSortDefault,
      confirmUnsend,
      confirmAwayToggle,
      warnMaliciousLinks,
      warnExternalFiles,
      warnExternalCanvases,
      channelSuggestions,
      surveys,
    } = req.body;

    // Validate enum values if provided
    if (enterBehavior && !['send', 'newline'].includes(enterBehavior)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enterBehavior. Must be one of: send, newline',
      });
    }

    if (searchShortcut && !['cmd_f', 'cmd_k'].includes(searchShortcut)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid searchShortcut. Must be one of: cmd_f, cmd_k',
      });
    }

    if (searchSortDefault && !['most_relevant', 'last_used'].includes(searchSortDefault)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid searchSortDefault. Must be one of: most_relevant, last_used',
      });
    }

    // Validate excludeChannelsFromSearch is an array if provided
    if (
      excludeChannelsFromSearch !== undefined &&
      !Array.isArray(excludeChannelsFromSearch)
    ) {
      return res.status(400).json({
        success: false,
        message: 'excludeChannelsFromSearch must be an array',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if advanced preferences already exist
    if (userPreferences.advanced) {
      return res.status(400).json({
        success: false,
        message: 'Advanced preferences already exist. Use PATCH to update.',
      });
    }

    // Create advanced preferences
    const advancedPrefs = await AdvancedPreferences.create({
      whenTypingCodeEnterShouldNotSend: whenTypingCodeEnterShouldNotSend ?? false,
      formatMessagesWithMarkup: formatMessagesWithMarkup ?? false,
      enterBehavior: enterBehavior ?? 'send',
      ctrlFStartsSearch: ctrlFStartsSearch ?? false,
      searchShortcut: searchShortcut ?? 'cmd_k',
      excludeChannelsFromSearch: excludeChannelsFromSearch ?? [],
      searchSortDefault: searchSortDefault ?? 'most_relevant',
      confirmUnsend: confirmUnsend ?? true,
      confirmAwayToggle: confirmAwayToggle ?? true,
      warnMaliciousLinks: warnMaliciousLinks ?? true,
      warnExternalFiles: warnExternalFiles ?? true,
      warnExternalCanvases: warnExternalCanvases ?? true,
      channelSuggestions: channelSuggestions ?? true,
      surveys: surveys ?? true,
    });

    // Link to user preferences
    userPreferences.advanced = advancedPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: advancedPrefs,
    });
  } catch (error) {
    console.log('Error in createAdvancedPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

