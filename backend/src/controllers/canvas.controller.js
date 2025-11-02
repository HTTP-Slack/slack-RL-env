import Canvas from '../models/canvas.model.js';
import User from '../models/user.model.js';

// @desc    create canvas
// @route   POST /api/canvas/
// @access  Private
/*
  body {
    title,
    content (optional, JSON/blob),
    organisationId,
    isTemplate (optional),
    type (optional)
  }
*/
export const createCanvas = async (req, res) => {
  try {
    const { title, content, organisationId, isTemplate, type } = req.body;
    if (!title || !organisationId) {
      return res.status(400).json({
        success: false,
        message: 'title and organisationId are required',
      });
    }

    const canvas = await Canvas.create({
      title,
      content,
      organisation: organisationId,
      createdBy: req.user.id,
      collaborators: [req.user.id],
      isTemplate: isTemplate || false,
      type,
      lastViewed: Date.now(),
    });

    const populatedCanvas = await Canvas.findById(canvas._id)
      .populate('collaborators')
      .populate('createdBy');

    res.status(201).json({
      success: true,
      data: populatedCanvas,
    });
  } catch (error) {
    console.log('Error in createCanvas:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    get canvases by organisation id
// @route   GET /api/canvas/org/:id
// @access  Private
/*
  query params (optional):
    filter - "all" | "shared" | "created"
    search - search keyword
*/
export const getCanvasesByOrg = async (req, res) => {
  try {
    const orgId = req.params.id;
    const { filter, search } = req.query;
    const userId = req.user.id;

    // Base query - all canvases in the organisation
    let query = { organisation: orgId };

    // Apply filters
    if (filter === 'shared') {
      // Canvases where user is collaborator but not creator
      query.collaborators = userId;
      query.createdBy = { $ne: userId };
    } else if (filter === 'created') {
      // Canvases created by user
      query.createdBy = userId;
    }
    // "all" or no filter: show all canvases in org (no additional filter)

    // Apply search if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const canvases = await Canvas.find(query)
      .populate('collaborators')
      .populate('createdBy')
      .populate('starredBy')
      .sort({ lastViewed: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: canvases,
    });
  } catch (error) {
    console.log('Error in getCanvasesByOrg:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    get canvas by id
// @route   GET /api/canvas/:id
// @access  Private
export const getCanvas = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const canvas = await Canvas.findById(id)
      .populate('collaborators')
      .populate('createdBy')
      .populate('starredBy');

    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found',
      });
    }

    // Check if user has access (creator or collaborator)
    const isCreator = canvas.createdBy._id.toString() === userId;
    const isCollaborator = canvas.collaborators.some(
      (collab) => collab._id.toString() === userId
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this canvas',
      });
    }

    // Update lastViewed timestamp
    canvas.lastViewed = Date.now();
    await canvas.save();

    res.status(200).json({
      success: true,
      data: canvas,
    });
  } catch (error) {
    console.log('Error in getCanvas:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update canvas by id
// @route   PATCH /api/canvas/:id
// @access  Private
/*
  body {
    title (optional),
    content (optional, JSON/blob)
  }
*/
export const updateCanvas = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const { title, content } = req.body;

    const canvas = await Canvas.findById(id);
    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found',
      });
    }

    // Check if user has permission (creator or collaborator)
    const isCreator = canvas.createdBy.toString() === userId;
    const isCollaborator = canvas.collaborators.some(
      (collab) => collab.toString() === userId
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this canvas',
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const updatedCanvas = await Canvas.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate('collaborators')
      .populate('createdBy')
      .populate('starredBy');

    res.status(200).json({
      success: true,
      data: updatedCanvas,
    });
  } catch (error) {
    console.log('Error in updateCanvas:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    delete canvas by id
// @route   DELETE /api/canvas/:id
// @access  Private
export const deleteCanvas = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const canvas = await Canvas.findById(id);
    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found',
      });
    }

    // Only creator can delete
    if (canvas.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this canvas',
      });
    }

    await Canvas.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Canvas deleted successfully',
    });
  } catch (error) {
    console.log('Error in deleteCanvas:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    add users as collaborators to canvas
// @route   PATCH /api/canvas/:id/collaborators
// @access  Private
/*
  body {
    "emails": [
      "alice@example.com",
      "bob@example.com"
    ]
  }
*/
export const addUserToCanvas = async (req, res) => {
  try {
    const id = req.params.id;
    const { emails } = req.body;

    const canvas = await Canvas.findById(id);
    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found',
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

    const updatedCanvas = await Canvas.findByIdAndUpdate(
      id,
      { $addToSet: { collaborators: { $each: userIdsToAdd } } },
      {
        new: true,
      }
    )
      .populate('collaborators')
      .populate('createdBy')
      .populate('starredBy');

    res.status(200).json({
      success: true,
      data: updatedCanvas,
    });
  } catch (error) {
    console.log('Error in addUserToCanvas:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update last viewed timestamp
// @route   PATCH /api/canvas/:id/view
// @access  Private
export const updateLastViewed = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const canvas = await Canvas.findById(id);
    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found',
      });
    }

    // Check if user has access
    const isCreator = canvas.createdBy.toString() === userId;
    const isCollaborator = canvas.collaborators.some(
      (collab) => collab.toString() === userId
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this canvas',
      });
    }

    canvas.lastViewed = Date.now();
    await canvas.save();

    const updatedCanvas = await Canvas.findById(id)
      .populate('collaborators')
      .populate('createdBy')
      .populate('starredBy');

    res.status(200).json({
      success: true,
      data: updatedCanvas,
    });
  } catch (error) {
    console.log('Error in updateLastViewed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    star/unstar canvas
// @route   PATCH /api/canvas/:id/star
// @access  Private
export const starCanvas = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const canvas = await Canvas.findById(id);
    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found',
      });
    }

    // Check if user has access
    const isCreator = canvas.createdBy.toString() === userId;
    const isCollaborator = canvas.collaborators.some(
      (collab) => collab.toString() === userId
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to star this canvas',
      });
    }

    // Toggle user in starredBy array
    const isStarred = canvas.starredBy.some(
      (starredId) => starredId.toString() === userId
    );

    if (isStarred) {
      // Remove from starredBy
      canvas.starredBy = canvas.starredBy.filter(
        (starredId) => starredId.toString() !== userId
      );
    } else {
      // Add to starredBy
      canvas.starredBy.push(userId);
    }

    await canvas.save();

    const updatedCanvas = await Canvas.findById(id)
      .populate('collaborators')
      .populate('createdBy')
      .populate('starredBy');

    res.status(200).json({
      success: true,
      data: updatedCanvas,
      isStarred: !isStarred,
    });
  } catch (error) {
    console.log('Error in starCanvas:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

