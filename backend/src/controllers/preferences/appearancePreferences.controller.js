import Preferences from '../../models/preferences/preferences.model.js';
import AppearancePreferences from '../../models/preferences/appearancePreferences.model.js';
import Theme from '../../models/preferences/theme.model.js';

// @desc    get user's appearance preferences
// @route   GET /api/preferences/appearance
// @access  Private
export const getAppearancePreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get appearance preferences
    let appearancePrefs = null;
    if (userPreferences.appearance) {
      appearancePrefs = await AppearancePreferences.findById(userPreferences.appearance);
    }

    // If appearance preferences don't exist, return defaults
    if (!appearancePrefs) {
      // Find or create default 'aubergine' theme
      let defaultTheme = await Theme.findOne({ name: 'Aubergine', isDefault: true });
      if (!defaultTheme) {
        defaultTheme = await Theme.create({
          name: 'Aubergine',
          category: 'single_colour',
          isDefault: true,
        });
      }

      appearancePrefs = await AppearancePreferences.create({
        font: 'Lato (Default)',
        colorMode: 'system',
        theme: defaultTheme._id,
        displayTypingIndicator: true,
        displayColorSwatches: true,
        emojiSkinTone: 'default',
        displayEmojiAsText: false,
        showJumbomoji: true,
        convertEmoticons: true,
        showOneClickReactions: true,
        customReactionEmojis: ['white_check_mark', 'speech_balloon', 'raised_hands'],
      });
      userPreferences.appearance = appearancePrefs._id;
      await userPreferences.save();
    }

    // Populate theme
    await appearancePrefs.populate('theme');

    res.status(200).json({
      success: true,
      data: appearancePrefs,
    });
  } catch (error) {
    console.log('Error in getAppearancePreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's appearance preferences
// @route   PATCH /api/preferences/appearance
// @access  Private
/*
  body {
    font (optional),
    colorMode (optional) - 'light', 'dark', 'system',
    theme (optional) - 'aubergine', 'clementine', 'banana', 'jade', 'lagoon', 'barbra', 'gray', 'mood_indigo',
    displayTypingIndicator (optional),
    displayColorSwatches (optional),
    emojiSkinTone (optional) - 'default', 'light', 'medium_light', 'medium', 'medium_dark', 'dark',
    displayEmojiAsText (optional),
    showJumbomoji (optional),
    convertEmoticons (optional),
    showOneClickReactions (optional),
    customReactionEmojis (optional) - array of strings
  }
*/
export const updateAppearancePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum values if provided
    if (updateData.colorMode && !['light', 'dark', 'system'].includes(updateData.colorMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid color mode. Must be one of: light, dark, system',
      });
    }

    // Validate theme exists if provided
    if (updateData.theme) {
      const theme = await Theme.findById(updateData.theme);
      if (!theme) {
        return res.status(400).json({
          success: false,
          message: 'Theme not found',
        });
      }
      // Check if user can access this theme (default themes or user's custom themes)
      if (!theme.isDefault && theme.createdBy?.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to use this theme',
        });
      }
    }

    if (
      updateData.emojiSkinTone &&
      !['default', 'light', 'medium_light', 'medium', 'medium_dark', 'dark'].includes(
        updateData.emojiSkinTone
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid emoji skin tone. Must be one of: default, light, medium_light, medium, medium_dark, dark',
      });
    }

    // Validate customReactionEmojis is an array if provided
    if (
      updateData.customReactionEmojis !== undefined &&
      !Array.isArray(updateData.customReactionEmojis)
    ) {
      return res.status(400).json({
        success: false,
        message: 'customReactionEmojis must be an array',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create appearance preferences
    let appearancePrefs = null;
    if (userPreferences.appearance) {
      appearancePrefs = await AppearancePreferences.findById(userPreferences.appearance);
    }

    if (!appearancePrefs) {
      // Find or create default 'aubergine' theme
      let defaultTheme = await Theme.findOne({ name: 'Aubergine', isDefault: true });
      if (!defaultTheme) {
        defaultTheme = await Theme.create({
          name: 'Aubergine',
          category: 'single_colour',
          isDefault: true,
        });
      }

      // Create with defaults and merge with update data
      appearancePrefs = await AppearancePreferences.create({
        font: 'Lato (Default)',
        colorMode: 'system',
        theme: updateData.theme || defaultTheme._id,
        displayTypingIndicator: true,
        displayColorSwatches: true,
        emojiSkinTone: 'default',
        displayEmojiAsText: false,
        showJumbomoji: true,
        convertEmoticons: true,
        showOneClickReactions: true,
        customReactionEmojis: ['white_check_mark', 'speech_balloon', 'raised_hands'],
        ...updateData,
      });
      userPreferences.appearance = appearancePrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          appearancePrefs[key] = updateData[key];
        }
      });
      await appearancePrefs.save();
    }

    // Populate theme before returning
    await appearancePrefs.populate('theme');

    res.status(200).json({
      success: true,
      data: appearancePrefs,
    });
  } catch (error) {
    console.log('Error in updateAppearancePreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create appearance preferences for user
// @route   POST /api/preferences/appearance
// @access  Private
/*
  body {
    font (optional),
    colorMode (optional) - 'light', 'dark', 'system',
    theme (optional) - 'aubergine', 'clementine', 'banana', 'jade', 'lagoon', 'barbra', 'gray', 'mood_indigo',
    displayTypingIndicator (optional),
    displayColorSwatches (optional),
    emojiSkinTone (optional) - 'default', 'light', 'medium_light', 'medium', 'medium_dark', 'dark',
    displayEmojiAsText (optional),
    showJumbomoji (optional),
    convertEmoticons (optional),
    showOneClickReactions (optional),
    customReactionEmojis (optional) - array of strings
  }
*/
export const createAppearancePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum values if provided
    if (updateData.colorMode && !['light', 'dark', 'system'].includes(updateData.colorMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid color mode. Must be one of: light, dark, system',
      });
    }

    // Validate theme exists if provided
    let themeId = updateData.theme;
    if (themeId) {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        return res.status(400).json({
          success: false,
          message: 'Theme not found',
        });
      }
      // Check if user can access this theme (default themes or user's custom themes)
      if (!theme.isDefault && theme.createdBy?.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to use this theme',
        });
      }
    }

    if (
      updateData.emojiSkinTone &&
      !['default', 'light', 'medium_light', 'medium', 'medium_dark', 'dark'].includes(
        updateData.emojiSkinTone
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid emoji skin tone. Must be one of: default, light, medium_light, medium, medium_dark, dark',
      });
    }

    // Validate customReactionEmojis is an array if provided
    if (
      updateData.customReactionEmojis !== undefined &&
      !Array.isArray(updateData.customReactionEmojis)
    ) {
      return res.status(400).json({
        success: false,
        message: 'customReactionEmojis must be an array',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if appearance preferences already exist
    if (userPreferences.appearance) {
      return res.status(400).json({
        success: false,
        message: 'Appearance preferences already exist. Use PATCH to update.',
      });
    }

    // Find or create default 'aubergine' theme if no theme provided
    if (!themeId) {
      let defaultTheme = await Theme.findOne({ name: 'Aubergine', isDefault: true });
      if (!defaultTheme) {
        defaultTheme = await Theme.create({
          name: 'Aubergine',
          category: 'single_colour',
          isDefault: true,
        });
      }
      themeId = defaultTheme._id;
    }

    // Create appearance preferences
    const appearancePrefs = await AppearancePreferences.create({
      font: updateData.font ?? 'Lato (Default)',
      colorMode: updateData.colorMode ?? 'system',
      theme: themeId,
      displayTypingIndicator: updateData.displayTypingIndicator ?? true,
      displayColorSwatches: updateData.displayColorSwatches ?? true,
      emojiSkinTone: updateData.emojiSkinTone ?? 'default',
      displayEmojiAsText: updateData.displayEmojiAsText ?? false,
      showJumbomoji: updateData.showJumbomoji ?? true,
      convertEmoticons: updateData.convertEmoticons ?? true,
      showOneClickReactions: updateData.showOneClickReactions ?? true,
      customReactionEmojis:
        updateData.customReactionEmojis ?? ['white_check_mark', 'speech_balloon', 'raised_hands'],
    });

    // Link to user preferences
    userPreferences.appearance = appearancePrefs._id;
    await userPreferences.save();

    // Populate theme before returning
    await appearancePrefs.populate('theme');

    res.status(201).json({
      success: true,
      data: appearancePrefs,
    });
  } catch (error) {
    console.log('Error in createAppearancePreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

