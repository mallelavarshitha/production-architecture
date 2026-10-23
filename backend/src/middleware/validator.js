const mongoose = require('mongoose');

/**
 * Validates MongoDB ObjectId in route params
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: `Invalid task ID format: '${id}'. Must be a valid 24-character hexadecimal ID.`,
    });
  }
  next();
};

/**
 * Validates request body for task creation
 */
const validateCreateTask = (req, res, next) => {
  const { title, description } = req.body;

  if (title === undefined || title === null) {
    return res.status(400).json({
      success: false,
      error: 'Task title is required.',
    });
  }

  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  if (trimmedTitle.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Task title cannot be blank.',
    });
  }

  if (trimmedTitle.length > 120) {
    return res.status(400).json({
      success: false,
      error: 'Task title cannot exceed 120 characters.',
    });
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Task description must be a text string.',
      });
    }
    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Task description cannot exceed 500 characters.',
      });
    }
  }

  // Sanitize cleaned values onto req.body
  req.body.title = trimmedTitle;
  req.body.description = description !== undefined && description !== null ? description.trim() : '';

  next();
};

/**
 * Validates request body for task update
 */
const validateUpdateTask = (req, res, next) => {
  const { title, description, completed } = req.body;

  if (title === undefined && description === undefined && completed === undefined) {
    return res.status(400).json({
      success: false,
      error: 'At least one field (title, description, or completed) must be provided to update.',
    });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Task title cannot be empty.',
      });
    }
    if (title.trim().length > 120) {
      return res.status(400).json({
        success: false,
        error: 'Task title cannot exceed 120 characters.',
      });
    }
    req.body.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Task description must be a string.',
      });
    }
    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Task description cannot exceed 500 characters.',
      });
    }
    req.body.description = description.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'The completed field must be a boolean (true or false).',
      });
    }
  }

  next();
};

module.exports = {
  validateObjectId,
  validateCreateTask,
  validateUpdateTask,
};
