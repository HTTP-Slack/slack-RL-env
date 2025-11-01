import Organisation from '../models/organisation.model.js';
import Channel from '../models/channel.model.js';
import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';
import { sendBulkInvitations } from '../services/email.service.js';

// @desc    get organisation
// @route   GET /api/organisation/:id
// @access  Private
export const getOrganisation = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Organisation ID is required',
      });
    }

    // 1. Fetch organisation, channels, and conversations in parallel
    const [organisation, channels, conversations] = await Promise.all([
      Organisation.findById(id).populate(['coWorkers', 'owner']),
      Channel.find({ organisation: id }).populate('collaborators'),
      Conversation.find({ organisation: id }).populate('collaborators'),
    ]);

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found',
      });
    }

    // 2. Filter conversations to only include those the current user is part of
    const conversationsWithCurrentUser = conversations.filter((conversation) =>
      conversation.collaborators.some(
        (collaborator) => collaborator._id.toString() === req.user.id
      )
    );

    // 3. Remap conversations to add a dynamic 'name' and 'createdBy'
    const updatedConversations = conversationsWithCurrentUser.map((convo) => {
      // Find the *other* user in the conversation
      const otherCollaborator = convo.collaborators.find(
        (coworker) => coworker._id.toString() !== req.user.id
      );

      // Use the other user's name, or the convo's default name if it's a group
      const name = otherCollaborator?.username || convo.name;

      return {
        ...convo.toObject(), // Convert Mongoose doc to plain object
        name,
        createdBy: otherCollaborator?._id, // Set createdBy to the other user's ID
      };
    });

    // 4. Find the current user's profile within the org's co-workers
    const profile = organisation.coWorkers.find(
      (coworker) => coworker._id.toString() === req.user.id
    );

    // 5. Build the final response object
    const updatedOrganisation = {
      ...organisation.toObject(),
      conversations: updatedConversations,
      channels,
      profile: profile || null, // Send profile or null
    };

    // 6. Send the successful response
    res.status(200).json({
      success: true,
      data: updatedOrganisation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
    console.log("Error in organisation controller", error);
  }
}

// @desc    Create a new organisation
// @route   POST /api/organisation
// @access  Private
/*
  body 
  {
    name: 
  }
*/
export const createOrganisation = async (req, res) => {
  try {
    const { name } = req.body;
    const ownerId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Organisation name is required',
      });
    }

    let organisation = await Organisation.create({
      name,
      owner: ownerId,
      coWorkers: [ownerId],
    });

    // generateJoinLink is a method on your model
    organisation.generateJoinLink();
    await organisation.save();

    // Populate the fields before sending back
    organisation = await organisation.populate(['coWorkers', 'owner']);

    res.status(201).json({
      success: true,
      data: organisation,
    });
  } catch (error) {
    console.log('Error in createOrganisation:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
};

// @desc    Update organisation name
// @route   PATCH /api/organisation/:id
// @access  Private
/*
  body 
  {
    name: 
  }
*/
export const updateOrganisation = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required for update',
      });
    }

    const organisation = await Organisation.findByIdAndUpdate(
      id,
      { $set: { name } },
      { new: true } // Return the updated document
    ).populate(['coWorkers', 'owner']);

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found',
      });
    }
    
    organisation.generateJoinLink();
    await organisation.save();

    res.status(200).json({
      success: true,
      data: organisation,
    });
  } catch (error) {
    console.log('Error in updateOrganisation:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
};

// @desc    Get organisations associated with the current user
// @route   GET /api/organisation/workspaces
// @access  Private
export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all organizations where the user is a co-worker
    const workspaces = await Organisation.find({ coWorkers: userId });

    // Fetch channels for each organization
    const workspacesWithChannels = await Promise.all(
      workspaces.map(async (workspace) => {
        const channels = await Channel.find({ organisation: workspace._id });
        return {
          ...workspace.toObject(),
          channels,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: workspacesWithChannels,
    });
  } catch (error) {
    console.log('Error in getWorkspaces:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
};

// @desc    Add one or more coworkers to an organisation
// @route   PATCH /api/organisation/:id/coworkers
// @access  Private
/*
  body 
  {
    emails: [
    
    ] 
  }
*/
export const addCoworkers = async (req, res) => {
  try {
    const { id: organisationId } = req.params;
    const { emails } = req.body; // Expect an array of emails

    // 1. Validation
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'An array of "emails" is required in the body',
      });
    }

    // 2. Find all users matching the provided emails
    const usersToAdd = await User.find({ email: { $in: emails } });

    if (usersToAdd.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with the provided emails',
      });
    }

    // Get the ObjectIds of the users we found
    const userIdsToAdd = usersToAdd.map(user => user._id);

    // 3. Find the organisation and add all new users in one atomic operation
    // We use $addToSet with $each:
    // - $addToSet: Prevents adding a user who is already a member.
    // - $each: Allows us to add all users from the array at once.
    const updatedOrganisation = await Organisation.findByIdAndUpdate(
      organisationId,
      { $addToSet: { coWorkers: { $each: userIdsToAdd } } },
      { new: true } // Return the updated document
    ).populate(['coWorkers', 'owner']);

    if (!updatedOrganisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found',
      });
    }

    // 4. (Optional but helpful) Report which emails were not found
    const foundUserEmails = usersToAdd.map(u => u.email);
    const notFoundEmails = emails.filter(e => !foundUserEmails.includes(e));

    let message = `Coworkers added successfully.`;
    if (notFoundEmails.length > 0) {
      message += ` Could not find users for: ${notFoundEmails.join(', ')}.`;
    }

    res.status(200).json({
      success: true,
      message: message,
      data: updatedOrganisation,
    });
  } catch (error) {
    console.log('Error in addCoworker:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
}

// @desc    Send invitation emails to colleagues
// @route   POST /api/organisation/:id/invite
// @access  Private
/*
  body 
  {
    emails: ["email1@example.com", "email2@example.com"]
  }
*/
export const inviteColleagues = async (req, res) => {
  try {
    const { id: organisationId } = req.params;
    const { emails } = req.body;

    // 1. Validation
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'An array of "emails" is required in the body',
      });
    }

    // 2. Find the organisation
    const organisation = await Organisation.findById(organisationId).populate('owner');
    
    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found',
      });
    }

    // 3. Check if the current user is authorized (owner or coworker)
    const isAuthorized = 
      organisation.owner._id.toString() === req.user.id ||
      organisation.coWorkers.some(coworkerId => coworkerId.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send invitations for this workspace',
      });
    }

    // 4. Get the inviter's name
    const inviter = await User.findById(req.user.id);
    const inviterName = inviter?.username || 'A colleague';

    // 5. Ensure join link exists
    if (!organisation.joinLink) {
      organisation.generateJoinLink();
      await organisation.save();
    }

    // 6. Prepare invitation data
    const invitations = emails.map(email => ({
      to: email,
      workspaceName: organisation.name,
      inviterName,
      joinLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/join/${organisation.joinLink}`,
    }));

    // 7. Send invitation emails
    const emailResults = await sendBulkInvitations(invitations);

    // 8. Try to add users who already have accounts
    const existingUsers = await User.find({ email: { $in: emails } });
    
    if (existingUsers.length > 0) {
      const existingUserIds = existingUsers.map(user => user._id);
      await Organisation.findByIdAndUpdate(
        organisationId,
        { $addToSet: { coWorkers: { $each: existingUserIds } } }
      );
    }

    // 9. Build response message
    let message = `Sent ${emailResults.successful} invitation(s) successfully.`;
    if (emailResults.failed > 0) {
      message += ` ${emailResults.failed} invitation(s) failed to send.`;
    }
    if (existingUsers.length > 0) {
      message += ` ${existingUsers.length} user(s) with existing accounts were added to the workspace.`;
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        totalSent: emailResults.successful,
        totalFailed: emailResults.failed,
        usersAdded: existingUsers.length,
      },
    });
  } catch (error) {
    console.log('Error in inviteColleagues:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// @desc    Join workspace using invitation link
// @route   POST /api/organisation/join/:joinLink
// @access  Private
export const joinByLink = async (req, res) => {
  try {
    const { joinLink } = req.params;
    const userId = req.user.id;

    if (!joinLink) {
      return res.status(400).json({
        success: false,
        message: 'Join link is required',
      });
    }

    // 1. Find the organisation with this join link
    const organisation = await Organisation.findOne({ joinLink }).populate(['coWorkers', 'owner']);
    
    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation link',
      });
    }

    // 2. Check if user is already a member
    const isAlreadyMember = organisation.coWorkers.some(
      coworker => coworker._id.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(200).json({
        success: true,
        message: 'You are already a member of this workspace',
        data: organisation,
      });
    }

    // 3. Add user to the workspace
    organisation.coWorkers.push(userId);
    await organisation.save();

    // 4. Populate the updated organisation
    const updatedOrganisation = await Organisation.findById(organisation._id).populate(['coWorkers', 'owner']);

    res.status(200).json({
      success: true,
      message: `Successfully joined ${organisation.name}`,
      data: updatedOrganisation,
    });
  } catch (error) {
    console.log('Error in joinByLink:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
