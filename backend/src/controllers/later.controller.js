/*
Later items represent reminders, tasks, or bookmarked content that users want to revisit.
This controller handles CRUD operations for Later items across three statuses:
- in-progress: Active reminders and tasks
- archived: Items saved for reference
- completed: Finished tasks

Each later item belongs to a user and an organization for proper access control.
*/

import LaterItem from '../models/laterItem.model.js';

// @desc    Get all later items for a user (with optional status filter)
// @route   GET /api/later?status=in-progress|archived|completed&organisationId=xxx
// @access  Private
export const getLaterItems = async (req, res) => {
  try {
    const { status, organisationId } = req.query;
    const userId = req.user.id;

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: 'Organisation ID is required',
      });
    }

    // Build query
    const query = {
      userId,
      organisation: organisationId
    };

    // Add status filter if provided
    if (status && ['in-progress', 'archived', 'completed'].includes(status)) {
      query.status = status;
    }

    const laterItems = await LaterItem.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: laterItems,
    });
  } catch (error) {
    console.log('Error in getLaterItems:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Get a single later item by ID
// @route   GET /api/later/:id
// @access  Private
export const getLaterItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const laterItem = await LaterItem.findOne({ _id: id, userId });

    if (!laterItem) {
      return res.status(404).json({
        success: false,
        message: 'Later item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: laterItem,
    });
  } catch (error) {
    console.log('Error in getLaterItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Create a new later item
// @route   POST /api/later
// @access  Private
export const createLaterItem = async (req, res) => {
  try {
    const { title, description, dueDate, organisationId } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: 'Organisation ID is required',
      });
    }

    const laterItem = await LaterItem.create({
      title: title.trim(),
      description: description?.trim() || '',
      userId,
      organisation: organisationId,
      dueDate: dueDate || null,
      status: 'in-progress',
    });

    res.status(201).json({
      success: true,
      data: laterItem,
      message: 'Later item created successfully',
    });
  } catch (error) {
    console.log('Error in createLaterItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Update a later item (title, description, dueDate)
// @route   PATCH /api/later/:id
// @access  Private
export const updateLaterItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    const userId = req.user.id;

    const laterItem = await LaterItem.findOne({ _id: id, userId });

    if (!laterItem) {
      return res.status(404).json({
        success: false,
        message: 'Later item not found',
      });
    }

    // Update fields if provided
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      laterItem.title = title.trim();
    }

    if (description !== undefined) {
      laterItem.description = description.trim();
    }

    if (dueDate !== undefined) {
      laterItem.dueDate = dueDate;
    }

    await laterItem.save();

    res.status(200).json({
      success: true,
      data: laterItem,
      message: 'Later item updated successfully',
    });
  } catch (error) {
    console.log('Error in updateLaterItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Update later item status (move between tabs)
// @route   PATCH /api/later/:id/status
// @access  Private
export const updateLaterItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status || !['in-progress', 'archived', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: in-progress, archived, completed',
      });
    }

    const laterItem = await LaterItem.findOne({ _id: id, userId });

    if (!laterItem) {
      return res.status(404).json({
        success: false,
        message: 'Later item not found',
      });
    }

    laterItem.status = status;
    await laterItem.save();

    res.status(200).json({
      success: true,
      data: laterItem,
      message: `Later item moved to ${status}`,
    });
  } catch (error) {
    console.log('Error in updateLaterItemStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Delete a later item
// @route   DELETE /api/later/:id
// @access  Private
export const deleteLaterItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const laterItem = await LaterItem.findOneAndDelete({ _id: id, userId });

    if (!laterItem) {
      return res.status(404).json({
        success: false,
        message: 'Later item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Later item deleted successfully',
    });
  } catch (error) {
    console.log('Error in deleteLaterItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
