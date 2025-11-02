import Channel from '../models/channel.model.js';
import { Section } from '../models/section.model.js';
import User from '../models/user.model.js';

// @desc    create channel
// @route   POST /api/channel/
// @access  Private
/*
  body {
    name,
    organisationId,
    sectionId
  }
*/
export const createChannel = async (req, res) => {
  try {
    const { name, organisationId, sectionId } = req.body;
    if (!name || !organisationId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "name, org id, and section id are required",
      });
    }

    const channel = await Channel.create({
      name,
      collaborators: [req.user.id],
      organisation: organisationId,
      section: sectionId,
    });

    await Section.findByIdAndUpdate(sectionId, {
      $push: { channels: channel._id },
    });

    res.status(201).json({
      success: true,
      data: channel,
    });
  } catch (error) {
    console.log('Error in createChannel:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

// @desc    get channel by organisation id
// @route   GET /api/channel/org/:id
// @access  Private
export const getChannelByOrg = async (req, res) => {
  try {
    const id = req.params.id;
    const channels = await Channel.find({ organisation: id })
      .populate({
        path: 'organisation',
        populate: [{ path: 'owner' }, { path: 'coWorkers' }],
      })
      .populate('collaborators')
      .sort({ _id: -1 });

    if (channels.length === 0) {
      return res.status(404).json({
        success: false,
        message: "channel with org id not found"
      });
    }

    res.status(200).json({
      success: true,
      data: channels
    })
  } catch (error) {
    console.log('Error in getChannelByOrg:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
}

// @desc    get channel by  id
// @route   GET /api/channel/:id
// @access  Private
export const getChannel = async (req, res) => {
  try {
    const id = req.params.id;
    const channel = await Channel.findById(id)
      .populate('collaborators');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "channel id not found"
      });
    }

    res.status(200).json({
      success: true,
      data: channel,
    });
  } catch (error) {
    console.log('Error in getChannel:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
}

// @desc    update channel by id (add users as collaborator to channel)
// @route   PATCH /api/channel/:id
// @access  Private
/*
  body 
  {
    "emails": [
      "alice@example.com",
      "bob@example.com"
    ] 
  }
*/
export const addUserToChannel = async (req, res) => {
  try {
    const id = req.params.id;
    const { emails } = req.body; // <-- 2. Get emails, not 'users'

    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'channel id not found',
      });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'An array of "emails" is required in the body',
      });
    }

    // --- 3. Find users by their emails ---
    const usersToAdd = await User.find({ email: { $in: emails } });
    if (usersToAdd.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with the provided emails',
      });
    }

    // --- 4. Get just their IDs ---
    const userIdsToAdd = usersToAdd.map((user) => user._id);

    const updatedChannel = await Channel.findByIdAndUpdate(
      id,
      // --- 5. Add the array of found user IDs ---
      { $addToSet: { collaborators: { $each: userIdsToAdd } } },
      {
        new: true,
      }
    ).populate('collaborators'); // Populate to show the full user objects in the response

    res.status(200).json({
      success: true,
      data: updatedChannel,
    });
  } catch (error) {
    console.log('Error in updateChannel:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};