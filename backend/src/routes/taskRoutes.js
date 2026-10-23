const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  validateObjectId,
  validateCreateTask,
  validateUpdateTask,
} = require('../middleware/validator');

const router = express.Router();

router
  .route('/')
  .get(getTasks)
  .post(validateCreateTask, createTask);

router
  .route('/:id')
  .get(validateObjectId, getTaskById)
  .put(validateObjectId, validateUpdateTask, updateTask)
  .delete(validateObjectId, deleteTask);

module.exports = router;
