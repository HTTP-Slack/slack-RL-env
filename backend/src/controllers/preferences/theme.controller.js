import Theme from '../../models/preferences/theme.model.js';

// @desc    get all themes
// @route   GET /api/preferences/themes
// @access  Private
/*
  query params (optional):
    category - filter by category ('single_colour', 'vision_assistive', 'fun_and_new', 'custom')
    userId - filter custom themes by user
*/
export const getThemes = async (req, res) => {
  try {
    const { category, userId } = req.query;

    let query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // For custom themes, filter by user if provided
    if (category === 'custom' || category === undefined) {
      if (userId) {
        query.createdBy = userId;
      } else if (!category) {
        // If no category specified and no userId, show all default themes + user's custom themes
        query.$or = [
          { isDefault: true },
          { createdBy: req.user.id },
        ];
      } else {
        // Category is 'custom' but no userId, show user's custom themes
        query.createdBy = req.user.id;
      }
    } else {
      // For non-custom categories, only show default themes
      query.isDefault = true;
    }

    const themes = await Theme.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: themes,
    });
  } catch (error) {
    console.log('Error in getThemes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    get theme by id
// @route   GET /api/preferences/themes/:id
// @access  Private
export const getTheme = async (req, res) => {
  try {
    const { id } = req.params;

    const theme = await Theme.findById(id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    // If custom theme, check if user has permission to view it
    if (theme.category === 'custom' && !theme.isDefault) {
      if (theme.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this theme',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.log('Error in getTheme:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create custom theme
// @route   POST /api/preferences/themes
// @access  Private
/*
  body {
    name (required),
    category: 'custom' (required),
    colors: {
      systemNavigation (optional),
      presenceIndication (optional),
      selectedItems (optional),
      notifications (optional)
    },
    windowGradient (optional)
  }
*/
export const createTheme = async (req, res) => {
  try {
    const { name, category, colors, windowGradient } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Theme name is required',
      });
    }

    // Custom themes must have category 'custom'
    if (category !== 'custom') {
      return res.status(400).json({
        success: false,
        message: 'Custom themes must have category "custom"',
      });
    }

    // Validate color format (hex codes)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (colors) {
      const colorFields = ['systemNavigation', 'presenceIndication', 'selectedItems', 'notifications'];
      for (const field of colorFields) {
        if (colors[field] && !hexColorRegex.test(colors[field])) {
          return res.status(400).json({
            success: false,
            message: `Invalid color format for ${field}. Must be a valid hex color code (e.g., #611F69)`,
          });
        }
      }
    }

    // Check if theme name already exists for this user
    const existingTheme = await Theme.findOne({
      name: name.trim(),
      createdBy: userId,
      category: 'custom',
    });

    if (existingTheme) {
      return res.status(400).json({
        success: false,
        message: 'A custom theme with this name already exists',
      });
    }

    // Create theme
    const theme = await Theme.create({
      name: name.trim(),
      category: 'custom',
      isDefault: false,
      colors: colors || {},
      windowGradient: windowGradient ?? false,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.log('Error in createTheme:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update custom theme
// @route   PATCH /api/preferences/themes/:id
// @access  Private
/*
  body {
    name (optional),
    colors (optional),
    windowGradient (optional)
  }
*/
export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, colors, windowGradient } = req.body;
    const userId = req.user.id;

    const theme = await Theme.findById(id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    // Only allow updating custom themes created by the user
    if (theme.isDefault || theme.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this theme',
      });
    }

    // Validate color format if provided
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (colors) {
      const colorFields = ['systemNavigation', 'presenceIndication', 'selectedItems', 'notifications'];
      for (const field of colorFields) {
        if (colors[field] && !hexColorRegex.test(colors[field])) {
          return res.status(400).json({
            success: false,
            message: `Invalid color format for ${field}. Must be a valid hex color code (e.g., #611F69)`,
          });
        }
      }
    }

    // Check if new name conflicts with existing theme
    if (name && name.trim() !== theme.name) {
      const existingTheme = await Theme.findOne({
        name: name.trim(),
        createdBy: userId,
        category: 'custom',
        _id: { $ne: id },
      });

      if (existingTheme) {
        return res.status(400).json({
          success: false,
          message: 'A custom theme with this name already exists',
        });
      }
    }

    // Update theme
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (colors !== undefined) updateData.colors = colors;
    if (windowGradient !== undefined) updateData.windowGradient = windowGradient;

    const updatedTheme = await Theme.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      data: updatedTheme,
    });
  } catch (error) {
    console.log('Error in updateTheme:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    delete custom theme
// @route   DELETE /api/preferences/themes/:id
// @access  Private
export const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const theme = await Theme.findById(id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    // Only allow deleting custom themes created by the user
    if (theme.isDefault || theme.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this theme',
      });
    }

    await Theme.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Theme deleted successfully',
    });
  } catch (error) {
    console.log('Error in deleteTheme:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

