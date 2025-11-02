import User from '../models/user.model.js';
import mongoose from 'mongoose';

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    // req.user is attached by the protectRoute middleware
    // We don't need to select('-password') because it's already selected false
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log('Error in getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Update user profile (username, phone, role)
// @route   PATCH /api/users/me
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { username, phone, role } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields if they were provided
    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (role) user.role = role; // Be careful with this, you might want extra auth

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log('Error in updateUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Update user profile picture
// @route   PATCH /api/users/me/picture
// @access  Private (requires 'upload' middleware)
export const updateProfilePicture = async (req, res) => {
  try {
    // req.file is added by the 'multer' upload middleware
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please upload an image.',
      });
    }

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update the picture fields
    user.profilePicture = req.file.buffer;
    user.profilePictureMimeType = req.file.mimetype;

    // Save the user
    // The 4MB size validation in your model will run here
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully.',
    });
  } catch (error) {
    console.log('Error in updateProfilePicture:', error);
    // Handle Mongoose validation error for file size
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Get a user's profile picture
// @route   GET /api/users/:id/picture
// @access  Public
export const getProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // We must explicitly select the picture fields
    const user = await User.findById(id).select(
      '+profilePicture +profilePictureMimeType'
    );

    if (!user || !user.profilePicture || !user.profilePictureMimeType) {
      return res.status(404).json({
        success: false,
        message: 'Profile picture not found for this user.',
      });
    }

    // Set the content type header to the image's MIME type
    res.set('Content-Type', user.profilePictureMimeType);
    // Send the binary buffer
    res.send(user.profilePicture);
  } catch (error) {
    console.log('Error in getProfilePicture:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
