import Message from "../models/message.model.js";

// @desc    get all messages matching queries
// @route   GET /api/message
// @access  Private
// @queries one of (?channelId, ?conversationId), ?isSelf, organisation
export const getMessages = async (req, res) => {
  const { channelId, conversationId, isSelf, organisation } = req.query;

  try {
    if (channelId) {
      const channel = await Message.find({
        channel: channelId,
        organisation,
      }).populate(["sender", "reactions.reactedToBy", "threadReplies"]);
      res.status(200).send({
        success: true,
        data: channel
      });
    } else if (conversationId) {
      let conversation;

      if (isSelf) {
        conversation = await Message.find({
          organisation,
          conversation: conversationId,
          isSelf,
        }).populate(["sender", "reactions.reactedToBy", "threadReplies"]);
      } else {
        conversation = await Message.find({
          organisation,
          conversation: conversationId,
        }).populate(["sender", "reactions.reactedToBy", "threadReplies"]);
      }
      res.status(200).send({
        success: true,
        data: conversation
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Missing query (channel id or conversationId)"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
    console.log("Error in message controller", error);
  }
};

// @desc    get message matching id
// @route   GET /api/message/:id
// @access  Private
export const getMessage = async (req, res) => {
  try {
    const id = req.params.id

    if (id) {
      const message = await Message.findById(id).populate([
        'sender',
        'threadReplies',
        'reactions.reactedToBy',
      ])

      if(!message) {
        return res.status(400).json({
          success: false,
          message: 'message not found',
        })
      }
      res.status(200).send({
        success: true,
        data: message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
    console.log("Error in message controller", error);
  }
}