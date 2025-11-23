const express = require('express');
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

// Create task
router.post(
  '/',
  auth,
  [body('title', 'Title is required').notEmpty()],
  taskController.createTask
);

// Get all tasks
router.get('/', auth, taskController.getTasks);

// Get single task
router.get('/:id', auth, taskController.getTask);

// Update task
router.put('/:id', auth, taskController.updateTask);

// Delete task
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
