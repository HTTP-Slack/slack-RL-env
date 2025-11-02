import Organisation from '../models/organisation.model.js';
import Conversation from '../models/conversation.model.js';
import Channel from '../models/channel.model.js';
import User from '../models/user.model.js';
import sendEmail from '../helpers/sendEmail.js';
import  joinTeammatesEmail  from '../html/join-teammates-email.js';

// @desc    add teammates to either organisation or a channel
// @route   POST /api/teammates
// @access  Private
/* body
{
  emails: [],
  channelId,
  organisationId,
  userIds: []
}
*/
export const createTeammates = async (req, res) => {
  try {
    const { emails, channelId, organisationId, userIds } = req.body;
    const invitedBy = await User.findById(req.user.id);

    // --- Block 1: Add EXISTING users (by ID) to a CHANNEL ---
    if (userIds?.length > 0 && channelId) {
      const channelExist = await Channel.findById(channelId);
      if (!channelExist) {
        return res
          .status(404)
          .json({ success: false, message: 'Channel not found' });
      }

      const organisation = await Organisation.findById(
        channelExist.organisation
      );
      if (!organisation) {
        return res.status(404).json({
          success: false,
          message: 'Organisation not found for this channel',
        });
      }

      // Update all users in one query
      const updatedChannel = await Channel.findByIdAndUpdate(
        channelId,
        { $addToSet: { collaborators: { $each: userIds } } },
        { new: true }
      ).populate('collaborators');

      // Send emails
      for (const id of userIds) {
        try {
          const user = await User.findById(id);
          if (user) {
            sendEmail(
              user.email,
              `${invitedBy.email} has invited you to work with them in Slack`,
              joinTeammatesEmail(
                invitedBy.username,
                invitedBy.email,
                organisation.name,
                req.user.id,
                organisation.joinLink,
                organisation.url
              )
            );
          }
        } catch (emailError) {
          console.log(`Failed to send email to user ${id}:`, emailError);
        }
      }

      return res.status(200).json({ success: true, data: updatedChannel });
    }

    // --- Block 2: Add NEW users (by email) to a CHANNEL (and Org) ---
    else if (emails?.length > 0 && channelId && organisationId) {
      const organisation = await Organisation.findById(organisationId);
      if (!organisation) {
        return res
          .status(404)
          .json({ success: false, message: 'Organisation not found' });
      }

      // Create all users first
      const newUsers = await Promise.all(
        emails.map((email) => User.create({ email }))
      );
      const newUserIds = newUsers.map((u) => u._id);

      // Add to channel and org in one go
      const [updatedChannel] = await Promise.all([
        Channel.findByIdAndUpdate(
          channelId,
          { $push: { collaborators: { $each: newUserIds } } },
          { new: true }
        ).populate('collaborators'),
        Organisation.findByIdAndUpdate(organisationId, {
          $push: { coWorkers: { $each: newUserIds } },
        }),
      ]);

      // Send emails
      for (const newUser of newUsers) {
        try {
          sendEmail(
            newUser.email,
            `${invitedBy.email} has invited you to work with them in Slack`,
            joinTeammatesEmail(
              invitedBy.username,
              invitedBy.email,
              organisation.name,
              req.user.id,
              organisation.joinLink,
              organisation.url
            )
          );
        } catch (emailError) {
          console.log(`Failed to send email to ${newUser.email}:`, emailError);
        }
      }

      return res.status(200).json({ success: true, data: updatedChannel });
    }

    // --- Block 3: Add NEW/EXISTING users (by email) to an ORGANISATION ---
    else if (emails?.length > 0 && organisationId) {
      let organisation = await Organisation.findById(organisationId);
      if (!organisation) {
        return res
          .status(404)
          .json({ success: false, message: 'Organisation not found' });
      }

      // Find existing, create new, then update org once
      const existingUsers = await User.find({ email: { $in: emails } });
      const existingEmails = existingUsers.map((u) => u.email);
      const newEmails = emails.filter((e) => !existingEmails.includes(e));

      const newUsers = await Promise.all(
        newEmails.map((email) => User.create({ email }))
      );
      const allUserIdsToAdd = [
        ...existingUsers.map((u) => u._id),
        ...newUsers.map((u) => u._id),
      ];

      // Add all users to the org in one go
      organisation = await Organisation.findByIdAndUpdate(
        organisationId,
        { $addToSet: { coWorkers: { $each: allUserIdsToAdd } } },
        { new: true }
      ).populate(['coWorkers', 'owner']);

      // Send emails
      for (const email of emails) {
        try {
          sendEmail(
            email,
            `${invitedBy.email} has invited you to work with them in Slack`,
            joinTeammatesEmail(
              invitedBy.username,
              invitedBy.email,
              organisation.name,
              req.user.id,
              organisation.joinLink,
              organisation.url
            )
          );
        } catch (emailError) {
          console.log(`Failed to send email to ${email}:`, emailError);
        }
      }

      // --- Conversation Creation Logic ---
      const allCoWorkers = organisation.coWorkers; // This is a populated array

      // Create pair conversations (O(n^2) but only checks, doesn't create if exists)
      for (let i = 0; i < allCoWorkers.length; i++) {
        for (let j = i + 1; j < allCoWorkers.length; j++) {
          const userA = allCoWorkers[i];
          const userB = allCoWorkers[j];
          const collaborators = [userA._id, userB._id];

          const existingConversation = await Conversation.findOne({
            collaborators: { $all: collaborators },
            organisation: organisationId,
            isSelf: false,
          });

          if (!existingConversation) {
            await Conversation.create({
              name: `${userA.username}, ${userB.username}`,
              description: `This conversation is between ${userA.username} and ${userB.username}`,
              organisation: organisationId,
              isSelf: false, // <-- Bug Fix
              collaborators: collaborators,
            });
          }
        }
      }

      // Create self-conversations
      for (let i = 0; i < allCoWorkers.length; i++) {
        const user = allCoWorkers[i];
        const selfConversationExists = await Conversation.findOne({
          collaborators: [user._id],
          organisation: organisationId,
          isSelf: true,
        });

        if (!selfConversationExists) {
          await Conversation.create({
            name: `${user.username}`,
            description: `This is a conversation with oneself (${user.username}).`,
            organisation: organisationId,
            isSelf: true,
            collaborators: [user._id],
          });
        }
      }
      // --- End Conversation Logic ---

      return res.status(200).json({ success: true, data: organisation });
    }

    // --- Fallback if no conditions are met ---
    else {
      return res.status(400).json({
        success: false,
        message:
          'Invalid request. Provide either userIds/channelId, emails/channelId, or emails/organisationId',
      });
    }
  } catch (error) {
    console.log('Error in createTeammates controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    get a teammate of an organisation
// @route   GET /api/teammates/:id
// @access  Private
export const getTeammate = async (req, res) => {
  try {
    const coworkerId = req.params.id;
    const coworker = await User.findById(coworkerId);

    if (!coworker) {
      return res.status(404).json({
        success: false,
        message: 'Coworker not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: coworker,
    });
  } catch (error) {
    console.log('Error in getTeammate controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};