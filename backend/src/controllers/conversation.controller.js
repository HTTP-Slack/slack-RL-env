/*
conversations represent chat or messaging threads in this Slack clone API. Here's what we can understand:

There are two main functions handling conversations:

-- getConversations: Retrieves all conversations for a given organization
-- getConversation: Retrieves a single conversation by its ID with more detailed information

Each conversation has:
--  An organization it belongs to
--  Collaborators (the users involved in the conversation)
--  A name (which can be either explicit or derived from the username of the other participant)
--  Messages
*/

import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';

// @desc    get conversations by org id
// @route   GET /api/conversation/org/:id
// @access  Private
export const getConversationsByOrg = async (req, res) => {
  const { id } = req.params;
  try {
    const conversations = await Conversation.find({ organisation: id }).sort({
      _id: -1,
    });

    if(!conversations) {
      return res.status(404).json({
        success: false,
        message: "organization not found"
      });
    }

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.log('Error in getConvByOrg:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
}

// @desc    get conversation by id
// @route   GET /api/conversation/:id
// @access  Private
export const getConversation = async (req, res) => {
  try {
    const id = req.params.id;
    const conversation = await Conversation.findById(id).populate(
      'collaborators'
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // This logic is for 1-on-1 DMs. It finds the *other* user
    // to display their name as the conversation's name.
    const otherCollaborator = conversation.collaborators.find(
      (coworker) => coworker._id.toString() !== req.user.id
    );

    // Use the other user's name, or the conversation's existing name (for group chats)
    const name = otherCollaborator?.username || conversation.name;

    // Create the final response object
    const responseData = {
      ...conversation.toObject(),
      name, // The new dynamic name
      collaborators: conversation.collaborators, // The original full list of members
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.log('Error in getConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};