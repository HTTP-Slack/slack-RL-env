import User from '../models/user.model.js';
import Channel from '../models/channel.model.js';
import Message from '../models/message.model.js';
import Canvas from '../models/canvas.model.js';
import Conversation from '../models/conversation.model.js';

export const unifiedSearch = async (req, res) => {
  try {
    const { query, organisation, channelId, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!query || !organisation) {
      return res.status(400).json({
        success: false,
        message: 'Query and organisation are required'
      });
    }

    // Create case-insensitive regex for search
    const searchRegex = new RegExp(query, 'i');

    // Parallel search across all entity types
    const [users, channels, messages, files, canvases, conversations] = await Promise.all([
      // Search users in the organisation
      User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex }
        ]
      })
        .limit(parseInt(limit))
        .select('_id username email profilePicture profilePictureMimeType')
        .lean(),

      // Search channels the user has access to
      Channel.find({
        organisation,
        collaborators: userId,
        $or: [
          { name: searchRegex },
          { title: searchRegex },
          { description: searchRegex }
        ]
      })
        .limit(parseInt(limit))
        .populate('collaborators', 'username email')
        .lean(),

      // Search messages in accessible channels/conversations
      channelId
        ? // If channelId is provided, search only in that channel
          Message.find({
            channel: channelId,
            organisation,
            content: searchRegex
          })
            .limit(parseInt(limit))
            .populate('sender', 'username email profilePicture profilePictureMimeType')
            .populate('channel', 'name')
            .sort({ createdAt: -1 })
            .lean()
        : // Otherwise, search in all accessible channels and conversations
          Message.find({
            organisation,
            $or: [
              { collaborators: userId }, // Messages in conversations
              { channel: { $exists: true } } // Messages in channels (will filter by access below)
            ],
            content: searchRegex
          })
            .limit(parseInt(limit))
            .populate('sender', 'username email profilePicture profilePictureMimeType')
            .populate('channel', 'name')
            .populate('conversation', 'name')
            .sort({ createdAt: -1 })
            .lean()
            .then(msgs =>
              // Filter messages to only include those from channels user has access to
              msgs.filter(msg =>
                msg.collaborators?.some(c => c.toString() === userId.toString()) ||
                !msg.channel // Keep DM messages
              )
            ),

      // Search files (from message attachments with filenames)
      channelId
        ? // Search files in specific channel
          Message.find({
            channel: channelId,
            organisation,
            attachments: { $exists: true, $ne: [] }
          })
            .limit(parseInt(limit))
            .populate('sender', 'username email')
            .populate('channel', 'name')
            .sort({ createdAt: -1 })
            .lean()
        : // Search files in all accessible messages
          Message.find({
            organisation,
            $or: [
              { collaborators: userId },
              { channel: { $exists: true } }
            ],
            attachments: { $exists: true, $ne: [] }
          })
            .limit(parseInt(limit))
            .populate('sender', 'username email')
            .populate('channel', 'name')
            .populate('conversation', 'name')
            .sort({ createdAt: -1 })
            .lean(),

      // Search canvases (workflows) user has access to
      Canvas.find({
        organisation,
        collaborators: userId,
        title: searchRegex
      })
        .limit(parseInt(limit))
        .populate('createdBy', 'username email')
        .populate('collaborators', 'username email')
        .lean(),

      // Search conversations user is part of
      Conversation.find({
        organisation,
        collaborators: userId,
        name: searchRegex
      })
        .limit(parseInt(limit))
        .populate('collaborators', 'username email profilePicture profilePictureMimeType')
        .lean()
    ]);

    // Format response
    const results = {
      users: users.map(user => ({
        ...user,
        type: 'user'
      })),
      channels: channels.map(channel => ({
        ...channel,
        type: 'channel'
      })),
      messages: messages.map(message => ({
        ...message,
        type: 'message'
      })),
      files: files.map(file => ({
        ...file,
        type: 'file'
      })),
      canvases: canvases.map(canvas => ({
        ...canvas,
        type: 'canvas'
      })),
      conversations: conversations.map(conversation => ({
        ...conversation,
        type: 'conversation'
      }))
    };

    res.status(200).json({
      success: true,
      data: results,
      totalResults:
        users.length +
        channels.length +
        messages.length +
        files.length +
        canvases.length +
        conversations.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};
