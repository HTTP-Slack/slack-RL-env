import Notification from '../models/notification.model.js';
import Channels from '../models/channel.model.js';
import Conversations from '../models/conversation.model.js';
import Preferences from '../models/preferences/preferences.model.js';
import NotificationPreferences from '../models/preferences/notificationPreferences.model.js';
import Organisation from '../models/organisation.model.js';
import User from '../models/user.model.js';
import { parseMentions } from './parseMentions.js';

/**
 * Create notifications for mentions in a message
 * @param {Object} params - Parameters object
 * @param {Object} params.message - The message document
 * @param {string} params.organisationId - Organisation ID
 * @param {string} params.senderId - ID of the user who sent the message
 * @param {Object} params.io - Socket.IO instance for real-time notifications
 */
export const createNotifications = async ({ message, organisationId, senderId, io }) => {
  try {
    const content = message.content || '';
    const messageId = message._id;

    // Parse mentions from message content
    const { mentionedUsers, hasChannelMention, hasHereMention, hasEveryoneMention } = await parseMentions(
      content,
      organisationId
    );

    // Get channel or conversation members
    let members = [];
    let channelId = null;
    let conversationId = null;
    let channelName = null;

    if (message.channel) {
      channelId = message.channel;
      const channel = await Channels.findById(channelId).populate('collaborators');
      if (channel) {
        members = channel.collaborators.map(c => c._id.toString());
        channelName = channel.name;
      }
    } else if (message.conversation) {
      conversationId = message.conversation;
      const conversation = await Conversations.findById(conversationId).populate('collaborators');
      if (conversation) {
        members = conversation.collaborators.map(c => c._id.toString());
      }
    }

    // Get organisation members
    const organisation = await Organisation.findById(organisationId).populate('coWorkers');
    const organisationMembers = organisation?.coWorkers?.map(c => c._id.toString()) || [];

    // Determine who should be notified
    const usersToNotify = new Set();

    // Add mentioned users
    mentionedUsers.forEach(userId => {
      if (userId !== senderId.toString()) {
        usersToNotify.add(userId);
      }
    });

    // Handle @channel mention - notify all channel members
    if (hasChannelMention && channelId) {
      members.forEach(memberId => {
        if (memberId !== senderId.toString()) {
          usersToNotify.add(memberId);
        }
      });
    }

    // Handle @here mention - notify online members only
    if (hasHereMention && channelId) {
      // Get online users from the organisation
      const onlineUsers = await User.find({
        _id: { $in: members },
        isOnline: true,
      }).select('_id');

      const onlineUserIds = onlineUsers.map(u => u._id.toString());
      
      onlineUserIds.forEach(memberId => {
        if (memberId !== senderId.toString()) {
          usersToNotify.add(memberId);
        }
      });
    }

    // Handle @everyone mention - notify all organisation members
    if (hasEveryoneMention) {
      organisationMembers.forEach(memberId => {
        if (memberId !== senderId.toString()) {
          usersToNotify.add(memberId);
        }
      });
    }

    // Create notifications based on user preferences
    const notifications = [];

    for (const userId of usersToNotify) {
      // Check user's notification preferences
      const userPreferences = await Preferences.findOne({ user: userId });
      let shouldNotify = true;

      if (userPreferences?.notifications) {
        const notificationPrefs = await NotificationPreferences.findById(
          userPreferences.notifications
        );

        if (notificationPrefs) {
          // Check notification type preference
          if (notificationPrefs.type === 'nothing') {
            shouldNotify = false;
          } else if (notificationPrefs.type === 'direct_mentions_keywords') {
            // Only notify if user is directly mentioned (not channel/here/everyone)
            const isDirectlyMentioned = mentionedUsers.includes(userId);
            if (!isDirectlyMentioned && !hasChannelMention && !hasHereMention && !hasEveryoneMention) {
              shouldNotify = false;
            }
          }
          // If type is 'all', shouldNotify remains true
        }
      }

      if (shouldNotify) {
        // Determine notification type
        let notificationType = 'mention';
        if (hasChannelMention || hasHereMention || hasEveryoneMention) {
          notificationType = 'channel_mention';
        } else if (mentionedUsers.includes(userId)) {
          notificationType = 'mention';
        } else if (conversationId) {
          notificationType = 'direct_message';
        }

        const notification = await Notification.create({
          user: userId,
          type: notificationType,
          message: messageId,
          channel: channelId || undefined,
          conversation: conversationId || undefined,
          organisation: organisationId,
          sender: senderId,
          isRead: false,
          metadata: {
            hasChannelMention,
            hasHereMention,
            hasEveryoneMention,
            channelName,
          },
        });

        notifications.push(notification);

        // Emit real-time notification to user via socket
        if (io) {
          const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'username email')
            .populate('message')
            .populate('channel', 'name')
            .populate('conversation')
            .populate('organisation', 'name');

          io.to(userId).emit('new-notification', populatedNotification);
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error creating notifications:', error);
    return [];
  }
};

