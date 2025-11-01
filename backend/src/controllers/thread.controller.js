import Thread from '../models/thread.model.js';

// @desc    get all threads for a specific message
// @route   GET /api/threads
// @access  Private
/*
  Query Params:
  ?message=<messageId>
*/
export const getThreads = async (req, res) => {
  try {
    const { message: messageId } = req.query;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'A message ID is required as a query parameter',
      });
    }

    const threads = await Thread.find({
      message: messageId,
    })
      .populate('sender')
      .populate('reactions.reactedToBy');

    // Returning an empty array '[]' is the correct behavior if no threads exist
    // so no 'not found' check is needed here.
    res.status(200).json({
      success: true,
      data: threads,
    });
  } catch (error) {
    console.log('Error in getThreads:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};