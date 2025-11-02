import Preferences from '../../models/preferences/preferences.model.js';
import LanguageRegionPreferences from '../../models/preferences/languageRegionPreferences.model.js';

// @desc    get user's language & region preferences
// @route   GET /api/preferences/language-region
// @access  Private
export const getLanguageRegionPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get language & region preferences
    let languageRegionPrefs = null;
    if (userPreferences.languageRegion) {
      languageRegionPrefs = await LanguageRegionPreferences.findById(userPreferences.languageRegion);
    }

    // If language & region preferences don't exist, return defaults
    if (!languageRegionPrefs) {
      languageRegionPrefs = await LanguageRegionPreferences.create({
        language: 'English (US)',
        timezone: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
        autoTimezone: true,
        keyboardLayout: 'English (US)',
        spellcheck: true,
      });
      userPreferences.languageRegion = languageRegionPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: languageRegionPrefs,
    });
  } catch (error) {
    console.log('Error in getLanguageRegionPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's language & region preferences
// @route   PATCH /api/preferences/language-region
// @access  Private
/*
  body {
    language (optional),
    timezone (optional),
    autoTimezone (optional),
    keyboardLayout (optional),
    spellcheck (optional)
  }
*/
export const updateLanguageRegionPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create language & region preferences
    let languageRegionPrefs = null;
    if (userPreferences.languageRegion) {
      languageRegionPrefs = await LanguageRegionPreferences.findById(userPreferences.languageRegion);
    }

    if (!languageRegionPrefs) {
      // Create with defaults and merge with update data
      languageRegionPrefs = await LanguageRegionPreferences.create({
        language: 'English (US)',
        timezone: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
        autoTimezone: true,
        keyboardLayout: 'English (US)',
        spellcheck: true,
        ...updateData,
      });
      userPreferences.languageRegion = languageRegionPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          languageRegionPrefs[key] = updateData[key];
        }
      });
      await languageRegionPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: languageRegionPrefs,
    });
  } catch (error) {
    console.log('Error in updateLanguageRegionPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create language & region preferences for user
// @route   POST /api/preferences/language-region
// @access  Private
/*
  body {
    language (optional),
    timezone (optional),
    autoTimezone (optional),
    keyboardLayout (optional),
    spellcheck (optional)
  }
*/
export const createLanguageRegionPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, timezone, autoTimezone, keyboardLayout, spellcheck } = req.body;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if language & region preferences already exist
    if (userPreferences.languageRegion) {
      return res.status(400).json({
        success: false,
        message: 'Language & region preferences already exist. Use PATCH to update.',
      });
    }

    // Create language & region preferences
    const languageRegionPrefs = await LanguageRegionPreferences.create({
      language: language ?? 'English (US)',
      timezone: timezone ?? '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
      autoTimezone: autoTimezone ?? true,
      keyboardLayout: keyboardLayout ?? 'English (US)',
      spellcheck: spellcheck ?? true,
    });

    // Link to user preferences
    userPreferences.languageRegion = languageRegionPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: languageRegionPrefs,
    });
  } catch (error) {
    console.log('Error in createLanguageRegionPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

