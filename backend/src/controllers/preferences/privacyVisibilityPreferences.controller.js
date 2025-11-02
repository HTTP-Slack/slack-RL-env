import mongoose from 'mongoose';
import Preferences from '../../models/preferences/preferences.model.js';
import PrivacyVisibilityPreferences from '../../models/preferences/privacyVisibilityPreferences.model.js';
import User from '../../models/user.model.js';

// Helper function to resolve userIdentifier (email or ObjectId) to User ObjectId
const resolveUserIdentifier = async (userIdentifier) => {
  if (!userIdentifier || typeof userIdentifier !== 'string') {
    return null;
  }

  // Check if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
    const user = await User.findById(userIdentifier);
    if (user) {
      return user._id;
    }
  }

  // Try to find by email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(userIdentifier)) {
    const user = await User.findOne({ email: userIdentifier });
    if (user) {
      return user._id;
    }
  }

  return null;
};

// @desc    get user's privacy & visibility preferences
// @route   GET /api/preferences/privacy-visibility
// @access  Private
export const getPrivacyVisibilityPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get privacy & visibility preferences
    let privacyVisibilityPrefs = null;
    if (userPreferences.privacyVisibility) {
      privacyVisibilityPrefs = await PrivacyVisibilityPreferences.findById(
        userPreferences.privacyVisibility,
      )
        .populate('blockedInvitations', 'email username')
        .populate('hiddenPeople', 'email username');
    }

    // If privacy & visibility preferences don't exist, return defaults
    if (!privacyVisibilityPrefs) {
      privacyVisibilityPrefs = await PrivacyVisibilityPreferences.create({
        slackConnectDiscoverable: true,
        contactSharing: 'all',
        blockedInvitations: [],
        hiddenPeople: [],
      });
      userPreferences.privacyVisibility = privacyVisibilityPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: privacyVisibilityPrefs,
    });
  } catch (error) {
    console.log('Error in getPrivacyVisibilityPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's privacy & visibility preferences
// @route   PATCH /api/preferences/privacy-visibility
// @access  Private
/*
  body {
    slackConnectDiscoverable (optional),
    contactSharing (optional) - 'all', 'workspace_only', 'none',
    blockedInvitations (optional) - array of strings,
    hiddenPeople (optional) - array of strings
  }
*/
export const updatePrivacyVisibilityPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum value if contactSharing is provided
    if (
      updateData.contactSharing &&
      !['all', 'workspace_only', 'none'].includes(updateData.contactSharing)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contactSharing. Must be one of: all, workspace_only, none',
      });
    }

    // Validate and convert blockedInvitations if provided
    if (updateData.blockedInvitations !== undefined) {
      if (!Array.isArray(updateData.blockedInvitations)) {
        return res.status(400).json({
          success: false,
          message: 'blockedInvitations must be an array',
        });
      }

      // Convert user identifiers to ObjectIds
      const resolvedBlockedInvitations = [];
      for (const identifier of updateData.blockedInvitations) {
        const userId = await resolveUserIdentifier(identifier);
        if (!userId) {
          return res.status(400).json({
            success: false,
            message: `Invalid user identifier in blockedInvitations: ${identifier}. Must be a valid user ID or email.`,
          });
        }
        resolvedBlockedInvitations.push(userId);
      }
      updateData.blockedInvitations = resolvedBlockedInvitations;
    }

    // Validate and convert hiddenPeople if provided
    if (updateData.hiddenPeople !== undefined) {
      if (!Array.isArray(updateData.hiddenPeople)) {
        return res.status(400).json({
          success: false,
          message: 'hiddenPeople must be an array',
        });
      }

      // Convert user identifiers to ObjectIds
      const resolvedHiddenPeople = [];
      for (const identifier of updateData.hiddenPeople) {
        const userId = await resolveUserIdentifier(identifier);
        if (!userId) {
          return res.status(400).json({
            success: false,
            message: `Invalid user identifier in hiddenPeople: ${identifier}. Must be a valid user ID or email.`,
          });
        }
        resolvedHiddenPeople.push(userId);
      }
      updateData.hiddenPeople = resolvedHiddenPeople;
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create privacy & visibility preferences
    let privacyVisibilityPrefs = null;
    if (userPreferences.privacyVisibility) {
      privacyVisibilityPrefs = await PrivacyVisibilityPreferences.findById(
        userPreferences.privacyVisibility,
      );
    }

    if (!privacyVisibilityPrefs) {
      // Create with defaults and merge with update data
      privacyVisibilityPrefs = await PrivacyVisibilityPreferences.create({
        slackConnectDiscoverable: true,
        contactSharing: 'all',
        blockedInvitations: [],
        hiddenPeople: [],
        ...updateData,
      });
      userPreferences.privacyVisibility = privacyVisibilityPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          privacyVisibilityPrefs[key] = updateData[key];
        }
      });
      await privacyVisibilityPrefs.save();
    }

    // Populate user references before returning
    await privacyVisibilityPrefs.populate('blockedInvitations', 'email username');
    await privacyVisibilityPrefs.populate('hiddenPeople', 'email username');

    res.status(200).json({
      success: true,
      data: privacyVisibilityPrefs,
    });
  } catch (error) {
    console.log('Error in updatePrivacyVisibilityPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    block invitation from a user
// @route   POST /api/preferences/privacy-visibility/blocked-invitations
// @access  Private
/*
  body {
    userIdentifier: string (user ID, email, or identifier)
  }
*/
export const blockInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userIdentifier } = req.body;

    if (!userIdentifier || typeof userIdentifier !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'userIdentifier is required and must be a string',
      });
    }

    // Resolve userIdentifier to ObjectId
    const targetUserId = await resolveUserIdentifier(userIdentifier);
    if (!targetUserId) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please provide a valid user ID or email.',
      });
    }

    // Prevent blocking yourself
    if (targetUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create privacy & visibility preferences
    let privacyVisibilityPrefs = null;
    if (userPreferences.privacyVisibility) {
      privacyVisibilityPrefs = await PrivacyVisibilityPreferences.findById(
        userPreferences.privacyVisibility,
      );
    }

    if (!privacyVisibilityPrefs) {
      privacyVisibilityPrefs = await PrivacyVisibilityPreferences.create({
        slackConnectDiscoverable: true,
        contactSharing: 'all',
        blockedInvitations: [targetUserId],
        hiddenPeople: [],
      });
      userPreferences.privacyVisibility = privacyVisibilityPrefs._id;
      await userPreferences.save();
    } else {
      // Convert to string for comparison
      const blockedIds = privacyVisibilityPrefs.blockedInvitations.map((id) => id.toString());
      if (!blockedIds.includes(targetUserId.toString())) {
        privacyVisibilityPrefs.blockedInvitations.push(targetUserId);
        await privacyVisibilityPrefs.save();
      }
    }

    // Populate user references before returning
    await privacyVisibilityPrefs.populate('blockedInvitations', 'email username');
    await privacyVisibilityPrefs.populate('hiddenPeople', 'email username');

    res.status(200).json({
      success: true,
      data: privacyVisibilityPrefs,
    });
  } catch (error) {
    console.log('Error in blockInvitation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    unblock invitation from a user
// @route   DELETE /api/preferences/privacy-visibility/blocked-invitations/:userIdentifier
// @access  Private
export const unblockInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userIdentifier } = req.params;

    if (!userIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'User identifier is required',
      });
    }

    // Resolve userIdentifier to ObjectId
    const targetUserId = await resolveUserIdentifier(userIdentifier);
    if (!targetUserId) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please provide a valid user ID or email.',
      });
    }

    // Get user preferences
    const userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences || !userPreferences.privacyVisibility) {
      return res.status(404).json({
        success: false,
        message: 'Privacy & visibility preferences not found',
      });
    }

    // Get privacy & visibility preferences
    const privacyVisibilityPrefs = await PrivacyVisibilityPreferences.findById(
      userPreferences.privacyVisibility,
    );
    if (!privacyVisibilityPrefs) {
      return res.status(404).json({
        success: false,
        message: 'Privacy & visibility preferences not found',
      });
    }

    // Remove from list (compare ObjectIds)
    privacyVisibilityPrefs.blockedInvitations = privacyVisibilityPrefs.blockedInvitations.filter(
      (item) => item.toString() !== targetUserId.toString(),
    );
    await privacyVisibilityPrefs.save();

    // Populate user references before returning
    await privacyVisibilityPrefs.populate('blockedInvitations', 'email username');
    await privacyVisibilityPrefs.populate('hiddenPeople', 'email username');

    res.status(200).json({
      success: true,
      data: privacyVisibilityPrefs,
    });
  } catch (error) {
    console.log('Error in unblockInvitation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    hide a person
// @route   POST /api/preferences/privacy-visibility/hidden-people
// @access  Private
/*
  body {
    userIdentifier: string (user ID, email, or identifier)
  }
*/
export const hidePerson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userIdentifier } = req.body;

    if (!userIdentifier || typeof userIdentifier !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'userIdentifier is required and must be a string',
      });
    }

    // Resolve userIdentifier to ObjectId
    const targetUserId = await resolveUserIdentifier(userIdentifier);
    if (!targetUserId) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please provide a valid user ID or email.',
      });
    }

    // Prevent hiding yourself
    if (targetUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot hide yourself',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create privacy & visibility preferences
    let privacyVisibilityPrefs = null;
    if (userPreferences.privacyVisibility) {
      privacyVisibilityPrefs = await PrivacyVisibilityPreferences.findById(
        userPreferences.privacyVisibility,
      );
    }

    if (!privacyVisibilityPrefs) {
      privacyVisibilityPrefs = await PrivacyVisibilityPreferences.create({
        slackConnectDiscoverable: true,
        contactSharing: 'all',
        blockedInvitations: [],
        hiddenPeople: [targetUserId],
      });
      userPreferences.privacyVisibility = privacyVisibilityPrefs._id;
      await userPreferences.save();
    } else {
      // Convert to string for comparison
      const hiddenIds = privacyVisibilityPrefs.hiddenPeople.map((id) => id.toString());
      if (!hiddenIds.includes(targetUserId.toString())) {
        privacyVisibilityPrefs.hiddenPeople.push(targetUserId);
        await privacyVisibilityPrefs.save();
      }
    }

    // Populate user references before returning
    await privacyVisibilityPrefs.populate('blockedInvitations', 'email username');
    await privacyVisibilityPrefs.populate('hiddenPeople', 'email username');

    res.status(200).json({
      success: true,
      data: privacyVisibilityPrefs,
    });
  } catch (error) {
    console.log('Error in hidePerson:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    unhide a person
// @route   DELETE /api/preferences/privacy-visibility/hidden-people/:userIdentifier
// @access  Private
export const unhidePerson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userIdentifier } = req.params;

    if (!userIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'User identifier is required',
      });
    }

    // Resolve userIdentifier to ObjectId
    const targetUserId = await resolveUserIdentifier(userIdentifier);
    if (!targetUserId) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please provide a valid user ID or email.',
      });
    }

    // Get user preferences
    const userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences || !userPreferences.privacyVisibility) {
      return res.status(404).json({
        success: false,
        message: 'Privacy & visibility preferences not found',
      });
    }

    // Get privacy & visibility preferences
    const privacyVisibilityPrefs = await PrivacyVisibilityPreferences.findById(
      userPreferences.privacyVisibility,
    );
    if (!privacyVisibilityPrefs) {
      return res.status(404).json({
        success: false,
        message: 'Privacy & visibility preferences not found',
      });
    }

    // Remove from list (compare ObjectIds)
    privacyVisibilityPrefs.hiddenPeople = privacyVisibilityPrefs.hiddenPeople.filter(
      (item) => item.toString() !== targetUserId.toString(),
    );
    await privacyVisibilityPrefs.save();

    // Populate user references before returning
    await privacyVisibilityPrefs.populate('blockedInvitations', 'email username');
    await privacyVisibilityPrefs.populate('hiddenPeople', 'email username');

    res.status(200).json({
      success: true,
      data: privacyVisibilityPrefs,
    });
  } catch (error) {
    console.log('Error in unhidePerson:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create privacy & visibility preferences for user
// @route   POST /api/preferences/privacy-visibility
// @access  Private
/*
  body {
    slackConnectDiscoverable (optional),
    contactSharing (optional) - 'all', 'workspace_only', 'none',
    blockedInvitations (optional) - array of strings,
    hiddenPeople (optional) - array of strings
  }
*/
export const createPrivacyVisibilityPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slackConnectDiscoverable, contactSharing, blockedInvitations, hiddenPeople } = req.body;

    // Validate enum value if contactSharing is provided
    if (contactSharing && !['all', 'workspace_only', 'none'].includes(contactSharing)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contactSharing. Must be one of: all, workspace_only, none',
      });
    }

    // Validate and convert blockedInvitations if provided
    let resolvedBlockedInvitations = [];
    if (blockedInvitations !== undefined) {
      if (!Array.isArray(blockedInvitations)) {
        return res.status(400).json({
          success: false,
          message: 'blockedInvitations must be an array',
        });
      }

      // Convert user identifiers to ObjectIds
      for (const identifier of blockedInvitations) {
        const resolvedUserId = await resolveUserIdentifier(identifier);
        if (!resolvedUserId) {
          return res.status(400).json({
            success: false,
            message: `Invalid user identifier in blockedInvitations: ${identifier}. Must be a valid user ID or email.`,
          });
        }
        resolvedBlockedInvitations.push(resolvedUserId);
      }
    }

    // Validate and convert hiddenPeople if provided
    let resolvedHiddenPeople = [];
    if (hiddenPeople !== undefined) {
      if (!Array.isArray(hiddenPeople)) {
        return res.status(400).json({
          success: false,
          message: 'hiddenPeople must be an array',
        });
      }

      // Convert user identifiers to ObjectIds
      for (const identifier of hiddenPeople) {
        const resolvedUserId = await resolveUserIdentifier(identifier);
        if (!resolvedUserId) {
          return res.status(400).json({
            success: false,
            message: `Invalid user identifier in hiddenPeople: ${identifier}. Must be a valid user ID or email.`,
          });
        }
        resolvedHiddenPeople.push(resolvedUserId);
      }
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if privacy & visibility preferences already exist
    if (userPreferences.privacyVisibility) {
      return res.status(400).json({
        success: false,
        message: 'Privacy & visibility preferences already exist. Use PATCH to update.',
      });
    }

    // Create privacy & visibility preferences
    const privacyVisibilityPrefs = await PrivacyVisibilityPreferences.create({
      slackConnectDiscoverable: slackConnectDiscoverable ?? true,
      contactSharing: contactSharing ?? 'all',
      blockedInvitations: resolvedBlockedInvitations,
      hiddenPeople: resolvedHiddenPeople,
    });

    // Link to user preferences
    userPreferences.privacyVisibility = privacyVisibilityPrefs._id;
    await userPreferences.save();

    // Populate user references before returning
    await privacyVisibilityPrefs.populate('blockedInvitations', 'email username');
    await privacyVisibilityPrefs.populate('hiddenPeople', 'email username');

    res.status(201).json({
      success: true,
      data: privacyVisibilityPrefs,
    });
  } catch (error) {
    console.log('Error in createPrivacyVisibilityPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

