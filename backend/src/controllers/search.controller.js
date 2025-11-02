import User from '../models/user.model.js';
import Channel from '../models/channel.model.js';
import Message from '../models/message.model.js';
import Canvas from '../models/canvas.model.js';
import Conversation from '../models/conversation.model.js';
import { searchFiles } from '../services/gridfs.service.js';

export const unifiedSearch = async (req, res) => {
  try {
    const {
      query,
      organisation,
      channelId,
      limit = 20,
      // Advanced filters
      from,
      with: withUser,
      before,
      after,
      on,
      hasFile,
      hasLink,
      isDM,
      isThread,
      isSaved,
      isPinned,
      fileType,
    } = req.query;
    const userId = req.user._id;

    if (!organisation) {
      return res.status(400).json({
        success: false,
        message: 'Organisation is required'
      });
    }

    // Create case-insensitive regex for search (if query exists)
    const searchRegex = query ? new RegExp(query, 'i') : null;

    // Parallel search across all entity types
    const [users, channels, messages, gridFSFiles, canvases, conversations] = await Promise.all([
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

      // Search messages with advanced filters
      (async () => {
        const messageQuery = {
          organisation,
        };

        // Text search
        if (searchRegex) {
          messageQuery.content = searchRegex;
        }

        // Channel filter
        if (channelId) {
          messageQuery.channel = channelId;
        } else if (!isDM) {
          messageQuery.$or = [
            { collaborators: userId },
            { channel: { $exists: true } }
          ];
        }

        // DM filter
        if (isDM === 'true') {
          messageQuery.conversation = { $exists: true };
          messageQuery.collaborators = userId;
        }

        // From filter (sender)
        if (from) {
          // Try to find user by username
          const fromUser = await User.findOne({
            $or: [
              { username: new RegExp(`^${from}$`, 'i') },
              { email: new RegExp(`^${from}$`, 'i') }
            ]
          });
          if (fromUser) {
            messageQuery.sender = fromUser._id;
          }
        }

        // Date filters
        if (before || after || on) {
          messageQuery.createdAt = {};
          if (before) messageQuery.createdAt.$lt = new Date(before);
          if (after) messageQuery.createdAt.$gt = new Date(after);
          if (on) {
            const onDate = new Date(on);
            const nextDay = new Date(onDate);
            nextDay.setDate(nextDay.getDate() + 1);
            messageQuery.createdAt.$gte = onDate;
            messageQuery.createdAt.$lt = nextDay;
          }
        }

        // Has file filter
        if (hasFile === 'true') {
          messageQuery.attachments = { $exists: true, $ne: [] };
        }

        // Saved/Pinned filters (these would need to be implemented in your message model)
        if (isSaved === 'true') {
          messageQuery.isBookmarked = true;
        }

        // Thread filter
        if (isThread === 'true') {
          messageQuery.threadRepliesCount = { $gt: 0 };
        }

        const msgs = await Message.find(messageQuery)
          .limit(parseInt(limit))
          .populate('sender', 'username email profilePicture profilePictureMimeType')
          .populate('channel', 'name')
          .populate('conversation', 'name')
          .sort({ createdAt: -1 })
          .lean();

        // Filter messages to only include those from channels user has access to
        return msgs.filter(msg =>
          msg.collaborators?.some(c => c.toString() === userId.toString()) ||
          !msg.channel
        );
      })(),

      // Search files by filename in GridFS
      searchFiles(query, organisation, channelId, parseInt(limit))
        .then(files => {
          // Convert GridFS files to a format similar to our other results
          return files.map(file => ({
            _id: file._id.toString(),
            filename: file.filename,
            contentType: file.contentType,
            length: file.length,
            uploadDate: file.uploadDate,
            metadata: file.metadata,
          }));
        }),

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
      files: gridFSFiles.map(file => ({
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
        gridFSFiles.length +
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
