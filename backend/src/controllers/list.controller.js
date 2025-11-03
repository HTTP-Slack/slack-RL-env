import List from '../models/list.model.js';
import ListItem from '../models/listItem.model.js';
import User from '../models/user.model.js';

// @desc    create list
// @route   POST /api/list/
// @access  Private
/*
  body {
    title,
    description (optional),
    organisationId
  }
*/
export const createList = async (req, res) => {
  try {
    const { title, description, organisationId, columns, template } = req.body;
    if (!title || !organisationId) {
      return res.status(400).json({
        success: false,
        message: 'title and organisationId are required',
      });
    }

    const list = await List.create({
      title,
      description,
      organisation: organisationId,
      createdBy: req.user.id,
      collaborators: [req.user.id],
      columns: columns || [],
      template: template || null,
    });

    res.status(201).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.log('Error in createList:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    get lists by organisation id
// @route   GET /api/list/org/:id
// @access  Private
export const getListsByOrg = async (req, res) => {
  try {
    const id = req.params.id;
    const lists = await List.find({ organisation: id })
      .populate('collaborators')
      .populate('createdBy')
      .sort({ _id: -1 });

    if (lists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No lists found for this organisation',
      });
    }

    res.status(200).json({
      success: true,
      data: lists,
    });
  } catch (error) {
    console.log('Error in getListsByOrg:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    get list by id
// @route   GET /api/list/:id
// @access  Private
export const getList = async (req, res) => {
  try {
    const id = req.params.id;
    const list = await List.findById(id)
      .populate('collaborators')
      .populate('createdBy');

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Update lastViewedBy
    await List.findByIdAndUpdate(id, {
      $addToSet: {
        lastViewedBy: {
          userId: req.user.id,
          timestamp: new Date(),
        },
      },
    });

    // Fetch list items separately
    const items = await ListItem.find({ listId: id })
      .sort({ order: 1, _id: -1 });

    const responseData = {
      ...list.toObject(),
      items,
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.log('Error in getList:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update list by id
// @route   PATCH /api/list/:id
// @access  Private
/*
  body {
    title (optional),
    description (optional)
  }
*/
export const updateList = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, columns } = req.body;

    const list = await List.findById(id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Check if user is a collaborator or creator
    const isCollaborator = list.collaborators.some(
      (collab) => collab.toString() === req.user.id
    );
    const isCreator = list.createdBy.toString() === req.user.id;

    if (!isCollaborator && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this list',
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (columns !== undefined) updateData.columns = columns;

    const updatedList = await List.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate('collaborators')
      .populate('createdBy');

    res.status(200).json({
      success: true,
      data: updatedList,
    });
  } catch (error) {
    console.log('Error in updateList:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    delete list by id
// @route   DELETE /api/list/:id
// @access  Private
export const deleteList = async (req, res) => {
  try {
    const id = req.params.id;

    const list = await List.findById(id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Check if user is creator
    if (list.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this list',
      });
    }

    // Delete all list items first (cascade delete)
    await ListItem.deleteMany({ listId: id });

    // Delete the list
    await List.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'List and all items deleted successfully',
    });
  } catch (error) {
    console.log('Error in deleteList:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    add users as collaborators to list
// @route   PATCH /api/list/:id/collaborators
// @access  Private
/*
  body {
    "emails": [
      "alice@example.com",
      "bob@example.com"
    ]
  }
*/
export const addUserToList = async (req, res) => {
  try {
    const id = req.params.id;
    const { emails } = req.body;

    const list = await List.findById(id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'An array of "emails" is required in the body',
      });
    }

    // Find users by their emails
    const usersToAdd = await User.find({ email: { $in: emails } });
    if (usersToAdd.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with the provided emails',
      });
    }

    // Get just their IDs
    const userIdsToAdd = usersToAdd.map((user) => user._id);

    const updatedList = await List.findByIdAndUpdate(
      id,
      { $addToSet: { collaborators: { $each: userIdsToAdd } } },
      {
        new: true,
      }
    ).populate('collaborators');

    res.status(200).json({
      success: true,
      data: updatedList,
    });
  } catch (error) {
    console.log('Error in addUserToList:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create list item
// @route   POST /api/list/:listId/items
// @access  Private
/*
  body {
    name,
    status (optional),
    priority (optional),
    description (optional),
    assignee (optional),
    dueDate (optional),
    order (optional)
  }
*/
export const createListItem = async (req, res) => {
  try {
    const { listId } = req.params;
    const { data, order } = req.body;

    // Verify list exists
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    const listItem = await ListItem.create({
      listId,
      data: data || {},
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      data: listItem,
    });
  } catch (error) {
    console.log('Error in createListItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    get list items
// @route   GET /api/list/:listId/items
// @access  Private
/*
  query params (optional):
    status - filter by status
    search - search in name and description
*/
export const getListItems = async (req, res) => {
  try {
    const { listId } = req.params;
    const { search } = req.query;

    // Verify list exists
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    const query = { listId };

    // Add search filter if provided
    if (search) {
      // Search through the data map - this is a simple implementation
      query.data = { $regex: search, $options: 'i' };
    }

    const items = await ListItem.find(query)
      .sort({ order: 1, _id: -1 });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.log('Error in getListItems:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update list item
// @route   PATCH /api/list/:listId/items/:itemId
// @access  Private
/*
  body {
    name (optional),
    status (optional),
    priority (optional),
    description (optional),
    assignee (optional),
    dueDate (optional),
    order (optional)
  }
*/
export const updateListItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const { data, order } = req.body;

    // Verify list exists
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Verify item exists
    const item = await ListItem.findOne({ _id: itemId, listId });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'List item not found',
      });
    }

    const updateData = {};
    if (data !== undefined) updateData.data = data;
    if (order !== undefined) updateData.order = order;

    const updatedItem = await ListItem.findByIdAndUpdate(itemId, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.log('Error in updateListItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    delete list item
// @route   DELETE /api/list/:listId/items/:itemId
// @access  Private
export const deleteListItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;

    // Verify list exists
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Verify item exists
    const item = await ListItem.findOne({ _id: itemId, listId });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'List item not found',
      });
    }

    await ListItem.findByIdAndDelete(itemId);

    res.status(200).json({
      success: true,
      message: 'List item deleted successfully',
    });
  } catch (error) {
    console.log('Error in deleteListItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    reorder list items
// @route   PATCH /api/list/:listId/items/reorder
// @access  Private
/*
  body {
    items: [{ id: itemId, order: number }]
  }
*/
export const reorderItems = async (req, res) => {
  try {
    const { listId } = req.params;
    const { items } = req.body;

    // Verify list exists
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Update all items with new order
    const updatePromises = items.map((item) =>
      ListItem.findByIdAndUpdate(item.id, { order: item.order })
    );
    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Items reordered successfully',
    });
  } catch (error) {
    console.log('Error in reorderItems:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    get templates
// @route   GET /api/list/templates
// @access  Private
export const getTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'feedback-tracker',
        name: 'Feedback tracker',
        description: 'A streamlined approach to keeping track of feedback from colleagues.',
        icon: '🎯',
        columns: [
          { id: 'col1', name: 'Feedback', type: 'text', required: true },
          { id: 'col2', name: 'Details', type: 'text' },
          {
            id: 'col3',
            name: 'Type',
            type: 'enum',
            options: ['Bug', 'Design note', 'Pain point', 'Praise'],
          },
          {
            id: 'col4',
            name: 'Severity',
            type: 'enum',
            options: ['Low', 'Medium', 'High'],
          },
          { id: 'col5', name: 'Submitted by', type: 'text' },
          { id: 'col6', name: 'Date submitted', type: 'date' },
          { id: 'col7', name: 'Assignee', type: 'text' },
          {
            id: 'col8',
            name: 'Status',
            type: 'enum',
            options: ['Not started', 'In progress', 'Backlog', 'Done'],
          },
        ],
      },
      {
        id: 'project-tracker',
        name: 'Project tracker',
        description: 'Keep track of your projects and their status.',
        icon: '📋',
        columns: [
          { id: 'col1', name: 'Name', type: 'text', required: true },
          { id: 'col2', name: 'Description', type: 'text' },
          {
            id: 'col3',
            name: 'Status',
            type: 'enum',
            options: ['Not started', 'In progress', 'Blocked', 'Completed'],
          },
          {
            id: 'col4',
            name: 'Priority',
            type: 'enum',
            options: ['Low', 'Medium', 'High'],
          },
          { id: 'col5', name: 'Owner', type: 'text' },
          { id: 'col6', name: 'Due date', type: 'date' },
        ],
      },
      {
        id: 'deal-tracker',
        name: 'Deal tracker',
        description: 'Track your sales deals and opportunities.',
        icon: '💰',
        columns: [
          { id: 'col1', name: 'Company', type: 'text', required: true },
          { id: 'col2', name: 'Contact', type: 'text' },
          { id: 'col3', name: 'Amount', type: 'int' },
          {
            id: 'col4',
            name: 'Stage',
            type: 'enum',
            options: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed'],
          },
          { id: 'col5', name: 'Close date', type: 'date' },
        ],
      },
      {
        id: 'help-request-tracker',
        name: 'Help request tracker',
        description: 'Track help requests and support tickets.',
        icon: '🆘',
        columns: [
          { id: 'col1', name: 'Request', type: 'text', required: true },
          { id: 'col2', name: 'Description', type: 'text' },
          {
            id: 'col3',
            name: 'Priority',
            type: 'enum',
            options: ['Low', 'Medium', 'High', 'Urgent'],
          },
          {
            id: 'col4',
            name: 'Status',
            type: 'enum',
            options: ['Open', 'In progress', 'Resolved', 'Closed'],
          },
          { id: 'col5', name: 'Assignee', type: 'text' },
          { id: 'col6', name: 'Created', type: 'date' },
        ],
      },
    ];

    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.log('Error in getTemplates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

