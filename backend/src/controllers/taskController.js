const Task = require('../models/Task');

/**
 * @desc    Get all tasks (with optional filtering)
 * @route   GET /api/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const { completed, status } = req.query;
    const filter = {};

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    } else if (status === 'completed') {
      filter.completed = true;
    } else if (status === 'pending') {
      filter.completed = false;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID '${req.params.id}' was not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const task = await Task.create({
      title,
      description: description || '',
      completed: false,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing task
 * @route   PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) updates.completed = completed;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID '${req.params.id}' was not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID '${req.params.id}' was not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Task '${task.title}' deleted successfully.`,
      data: { id: task._id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
