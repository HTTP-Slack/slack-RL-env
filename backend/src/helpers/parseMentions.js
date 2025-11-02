import User from '../models/user.model.js';
import Organisation from '../models/organisation.model.js';

/**
 * Parse mentions from message content
 * Supports @username, @channel, @here, @everyone
 * @param {string} content - Message content
 * @param {string} organisationId - Organisation ID to find users
 * @returns {Promise<Object>} Object containing { mentionedUsers: Array, hasChannelMention: boolean, hasHereMention: boolean, hasEveryoneMention: boolean }
 */
export const parseMentions = async (content, organisationId) => {
  if (!content || typeof content !== 'string') {
    return { mentionedUsers: [], hasChannelMention: false, hasHereMention: false, hasEveryoneMention: false };
  }

  const mentionedUsers = [];
  let hasChannelMention = false;
  let hasHereMention = false;
  let hasEveryoneMention = false;

  // Get organisation members for membership validation
  let organisationMembers = [];
  if (organisationId) {
    try {
      const organisation = await Organisation.findById(organisationId).populate('coWorkers');
      organisationMembers = organisation?.coWorkers?.map(c => c._id.toString()) || [];
    } catch (error) {
      console.error(`Error fetching organisation ${organisationId}:`, error);
    }
  }

  // Match @username patterns (case-insensitive)
  const usernameMentions = content.match(/@(\w+)/g) || [];
  
  for (const mention of usernameMentions) {
    const username = mention.substring(1).toLowerCase(); // Remove @ and lowercase
    
    // Check for special mentions
    if (username === 'channel' || username === 'here' || username === 'everyone') {
      if (username === 'channel') {
        hasChannelMention = true;
      } else if (username === 'here') {
        hasHereMention = true;
      } else if (username === 'everyone') {
        hasEveryoneMention = true;
      }
      continue;
    }

    // Find user by username in the organisation
    try {
      const user = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, 'i') },
      });

      if (user) {
        const userId = user._id.toString();
        // Check if user is in the organisation
        if (organisationId && organisationMembers.length > 0) {
          if (organisationMembers.includes(userId)) {
            mentionedUsers.push(userId);
          }
        } else {
          // If no organisation provided or no members, add the user anyway
          mentionedUsers.push(userId);
        }
      }
    } catch (error) {
      console.error(`Error finding user for mention @${username}:`, error);
    }
  }

  // Remove duplicates
  const uniqueMentionedUsers = [...new Set(mentionedUsers)];

  return {
    mentionedUsers: uniqueMentionedUsers,
    hasChannelMention,
    hasHereMention,
    hasEveryoneMention,
  };
};

