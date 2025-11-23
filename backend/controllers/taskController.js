const Task = require('../models/Task');
const getIO = () => require('../server').io;
const Folder = require('../models/Folder');

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, folderId, priority, dueDate } = req.body;

    if (!title || !folderId) {
      return res
        .status(400)
        .json({ error: 'Title and folder ID are required' });
    }

    const task = new Task({
      title,
      description,
      userId: req.userId,
      folderId,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await task.save();
    await task.populate('folderId');
    // Emit event to all users in the folder
    try {
      getIO().to(folderId).emit('taskUpdated', { action: 'create', task });
    } catch (e) {}

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all tasks for user or shared folder
exports.getTasks = async (req, res) => {
  try {
    const { folderId } = req.query;
    let query = { userId: req.userId };
    if (folderId) {
      // Check if user is owner or sharedWith
      const folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }
      const isOwner = folder.userId.toString() === req.userId.toString();
      const isShared = folder.sharedWith.some(
        (share) => share.userId.toString() === req.userId.toString()
      );
      if (isOwner || isShared) {
        // Show all tasks in the folder
        query = { folderId };
      } else {
        // Not authorized
        return res.status(403).json({ error: 'Not authorized' });
      }
    }
    const tasks = await Task.find(query)
      .populate('folderId')
      .sort({ completed: 1, dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('folderId');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    // Check if user is owner or has edit access in sharedWith
    const folder = await Folder.findById(task.folderId);
    // Defensive: folder might be deleted/missing or sharedWith might be undefined
    const isOwner = task.userId && task.userId.toString() === req.userId.toString();
    console.log(`UpdateTask: user=${req.userId}, taskOwner=${task.userId}, folderId=${task.folderId}`);
    const isSharedEditor = folder?.sharedWith?.some(
      (share) => share.userId.toString() === req.userId.toString() && share.accessLevel === 'edit'
    );
    if (!isOwner && !isSharedEditor) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { title, description, priority, dueDate, completed, folderId } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (dueDate === null) task.dueDate = null;
    if (completed !== undefined) task.completed = completed;
    if (folderId) task.folderId = folderId;
    await task.save();
    await task.populate('folderId');
    // Emit event to all users in the folder
    try {
      getIO().to(task.folderId._id.toString()).emit('taskUpdated', {
        action: 'update',
        task,
      });
    } catch (e) {}
    res.json({ message: 'Task updated', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    // Check if user is owner or has edit access in sharedWith
    const folder = await Folder.findById(task.folderId);
    // Defensive checks to avoid runtime errors when folder is missing
    const isOwner = task.userId && task.userId.toString() === req.userId.toString();
    console.log(`DeleteTask: user=${req.userId}, taskOwner=${task.userId}, folderId=${task.folderId}`);
    const isSharedEditor = folder?.sharedWith?.some(
      (share) => share.userId.toString() === req.userId.toString() && share.accessLevel === 'edit'
    );
    if (!isOwner && !isSharedEditor) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Task.findByIdAndDelete(req.params.id);
    // Emit event to all users in the folder
    try {
      getIO().to(task.folderId.toString()).emit('taskUpdated', { action: 'delete', taskId: task._id });
    } catch (e) {}
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
