import PinnedMessage from '../models/pinnedMessage.model.js';
import Message from '../models/message.model.js';

// @desc    Pin a message to a channel or conversation
// @route   POST /api/pinned-messages
// @access  Private
// @body    { messageId, channelId OR conversationId, organisation }
export const pinMessage = async (req, res) => {
  try {
    const { messageId, channelId, conversationId, organisation } = req.body;
    const userId = req.user.id;

    // Validation
    if (!messageId || !organisation) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: messageId and organisation',
      });
    }

    if (!channelId && !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Must specify either channelId or conversationId',
      });
    }

    // Check if message exists
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if message is already pinned
    const existingPin = await PinnedMessage.findOne({
      message: messageId,
      ...(channelId ? { channel: channelId } : { conversation: conversationId }),
    });

    if (existingPin) {
      return res.status(400).json({
        success: false,
        message: 'Message is already pinned',
      });
    }

    // Create pinned message
    const pinnedMessageData = {
      message: messageId,
      organisation,
      pinnedBy: userId,
    };

    if (channelId) {
      pinnedMessageData.channel = channelId;
    } else {
      pinnedMessageData.conversation = conversationId;
    }

    const pinnedMessage = await PinnedMessage.create(pinnedMessageData);

    // Populate the pinned message with message details
    const populatedPin = await PinnedMessage.findById(pinnedMessage._id)
      .populate({
        path: 'message',
        populate: {
          path: 'sender',
          select: 'username email profilePicture',
        },
      })
      .populate('pinnedBy', 'username email profilePicture');

    res.status(201).json({
      success: true,
      data: populatedPin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
    console.log('Error in pinMessage controller', error);
  }
};

// @desc    Unpin a message from a channel or conversation
// @route   DELETE /api/pinned-messages/:messageId
// @access  Private
// @query   channelId OR conversationId
export const unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { channelId, conversationId } = req.query;

    if (!channelId && !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Must specify either channelId or conversationId',
      });
    }

    // Find and delete the pinned message
    const deletedPin = await PinnedMessage.findOneAndDelete({
      message: messageId,
      ...(channelId ? { channel: channelId } : { conversation: conversationId }),
    });

    if (!deletedPin) {
      return res.status(404).json({
        success: false,
        message: 'Pinned message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message unpinned successfully',
      data: deletedPin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
    console.log('Error in unpinMessage controller', error);
  }
};

// @desc    Get all pinned messages for a channel or conversation
// @route   GET /api/pinned-messages
// @access  Private
// @query   channelId OR conversationId, organisation
export const getPinnedMessages = async (req, res) => {
  try {
    const { channelId, conversationId, organisation } = req.query;

    if (!organisation) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: organisation',
      });
    }

    if (!channelId && !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Must specify either channelId or conversationId',
      });
    }

    // Find all pinned messages
    const pinnedMessages = await PinnedMessage.find({
      organisation,
      ...(channelId ? { channel: channelId } : { conversation: conversationId }),
    })
      .populate({
        path: 'message',
        populate: {
          path: 'sender',
          select: 'username email profilePicture',
        },
      })
      .populate('pinnedBy', 'username email profilePicture')
      .sort({ createdAt: -1 }); // Most recently pinned first

    res.status(200).json({
      success: true,
      data: pinnedMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
    console.log('Error in getPinnedMessages controller', error);
  }
};

// @desc    Check if a message is pinned
// @route   GET /api/pinned-messages/:messageId/check
// @access  Private
// @query   channelId OR conversationId
export const checkIfPinned = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { channelId, conversationId } = req.query;

    if (!channelId && !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Must specify either channelId or conversationId',
      });
    }

    const pinnedMessage = await PinnedMessage.findOne({
      message: messageId,
      ...(channelId ? { channel: channelId } : { conversation: conversationId }),
    }).populate('pinnedBy', 'username email profilePicture');

    res.status(200).json({
      success: true,
      isPinned: !!pinnedMessage,
      data: pinnedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
    console.log('Error in checkIfPinned controller', error);
  }
};
