import Organisation from '../models/organisation.model.js';
import Channel from '../models/channel.model.js';
import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';

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