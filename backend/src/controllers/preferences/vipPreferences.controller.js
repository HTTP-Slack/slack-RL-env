import Preferences from '../../models/preferences/preferences.model.js';
import VIPPreferences from '../../models/preferences/vipPreferences.model.js';

// @desc    get user's VIP preferences
// @route   GET /api/vip-preferences
// @access  Private
export const getVIPPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get VIP preferences
    let vipPrefs = null;
    if (userPreferences.vip) {
      vipPrefs = await VIPPreferences.findById(userPreferences.vip);
    }

    // If VIP preferences don't exist, return defaults
    if (!vipPrefs) {
      vipPrefs = await VIPPreferences.create({
        allowFromVIPs: false,
        vipList: [],
      });
      userPreferences.vip = vipPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: vipPrefs,
    });
  } catch (error) {
    console.log('Error in getVIPPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's VIP preferences
// @route   PATCH /api/vip-preferences
// @access  Private
/*
  body {
    allowFromVIPs (optional),
    vipList (optional) - array of strings
  }
*/
export const updateVIPPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate vipList is an array if provided
    if (updateData.vipList !== undefined && !Array.isArray(updateData.vipList)) {
      return res.status(400).json({
        success: false,
        message: 'vipList must be an array',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create VIP preferences
    let vipPrefs = null;
    if (userPreferences.vip) {
      vipPrefs = await VIPPreferences.findById(userPreferences.vip);
    }

    if (!vipPrefs) {
      // Create with defaults and merge with update data
      vipPrefs = await VIPPreferences.create({
        allowFromVIPs: false,
        vipList: [],
        ...updateData,
      });
      userPreferences.vip = vipPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          vipPrefs[key] = updateData[key];
        }
      });
      await vipPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: vipPrefs,
    });
  } catch (error) {
    console.log('Error in updateVIPPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    add VIP to user's VIP list
// @route   POST /api/vip-preferences/vip-list
// @access  Private
/*
  body {
    vip: string (user ID, name, or identifier)
  }
*/
export const addVIP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vip } = req.body;

    if (!vip || typeof vip !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'vip is required and must be a string',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create VIP preferences
    let vipPrefs = null;
    if (userPreferences.vip) {
      vipPrefs = await VIPPreferences.findById(userPreferences.vip);
    }

    if (!vipPrefs) {
      vipPrefs = await VIPPreferences.create({
        allowFromVIPs: false,
        vipList: [vip],
      });
      userPreferences.vip = vipPrefs._id;
      await userPreferences.save();
    } else {
      // Add to list if not already present
      if (!vipPrefs.vipList.includes(vip)) {
        vipPrefs.vipList.push(vip);
        await vipPrefs.save();
      }
    }

    res.status(200).json({
      success: true,
      data: vipPrefs,
    });
  } catch (error) {
    console.log('Error in addVIP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    remove VIP from user's VIP list
// @route   DELETE /api/vip-preferences/vip-list/:vip
// @access  Private
export const removeVIP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vip } = req.params;

    if (!vip) {
      return res.status(400).json({
        success: false,
        message: 'VIP identifier is required',
      });
    }

    // Get user preferences
    const userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences || !userPreferences.vip) {
      return res.status(404).json({
        success: false,
        message: 'VIP preferences not found',
      });
    }

    // Get VIP preferences
    const vipPrefs = await VIPPreferences.findById(userPreferences.vip);
    if (!vipPrefs) {
      return res.status(404).json({
        success: false,
        message: 'VIP preferences not found',
      });
    }

    // Remove from list
    vipPrefs.vipList = vipPrefs.vipList.filter((item) => item !== vip);
    await vipPrefs.save();

    res.status(200).json({
      success: true,
      data: vipPrefs,
    });
  } catch (error) {
    console.log('Error in removeVIP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create VIP preferences for user
// @route   POST /api/vip-preferences
// @access  Private
/*
  body {
    allowFromVIPs (optional),
    vipList (optional) - array of strings
  }
*/
export const createVIPPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { allowFromVIPs, vipList } = req.body;

    // Validate vipList is an array if provided
    if (vipList !== undefined && !Array.isArray(vipList)) {
      return res.status(400).json({
        success: false,
        message: 'vipList must be an array',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if VIP preferences already exist
    if (userPreferences.vip) {
      return res.status(400).json({
        success: false,
        message: 'VIP preferences already exist. Use PATCH to update.',
      });
    }

    // Create VIP preferences
    const vipPrefs = await VIPPreferences.create({
      allowFromVIPs: allowFromVIPs ?? false,
      vipList: vipList ?? [],
    });

    // Link to user preferences
    userPreferences.vip = vipPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: vipPrefs,
    });
  } catch (error) {
    console.log('Error in createVIPPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

