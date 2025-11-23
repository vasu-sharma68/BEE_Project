const Folder = require('../models/Folder');
const Task = require('../models/Task');

// Create folder
exports.createFolder = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // No limit on number of folders (unlimited)

    const folder = new Folder({
      name,
      color: color || '#3498db',
      userId: req.userId,
    });

    await folder.save();

    res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all folders for user
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.userId })
      .populate({
        path: 'sharedWith.userId',
        select: 'username email'
      })
      .sort({
        isPinned: -1,
        createdAt: -1,
      });

    res.json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single folder
exports.getFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate({
        path: 'sharedWith.userId',
        select: 'username email'
      });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update folder
exports.updateFolder = async (req, res) => {
  try {
    let folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, color, isPinned } = req.body;

    if (name) folder.name = name;
    if (color) folder.color = color;
    if (isPinned !== undefined) folder.isPinned = isPinned;

    await folder.save();

    res.json({ message: 'Folder updated', folder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete all tasks in the folder
    await Task.deleteMany({ folderId: req.params.id });

    await Folder.findByIdAndDelete(req.params.id);

    res.json({ message: 'Folder deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Share folder with another user
exports.shareFolder = async (req, res) => {
  try {
    const { email, accessLevel } = req.body;
    const folderId = req.params.id;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to share this folder' });
    }

    // Get the User model
    const User = require('../models/User');
    const sharedWithUser = await User.findOne({ email });

    if (!sharedWithUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (sharedWithUser._id.toString() === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot share with yourself' });
    }

    // Check if already shared
    const alreadyShared = folder.sharedWith.some(
      (share) => share.userId.toString() === sharedWithUser._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ error: 'Folder already shared with this user' });
    }

    // Add to sharedWith array
    folder.sharedWith.push({
      userId: sharedWithUser._id,
      accessLevel: accessLevel || 'view',
    });

    await folder.save();

    res.status(200).json({ message: 'Folder shared successfully', folder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get shared folders (folders shared with current user)
exports.getSharedFolders = async (req, res) => {
  try {
    const folders = await Folder.find({
      'sharedWith.userId': req.userId,
    }).populate('userId', 'username email');

    res.json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove user from shared folder
exports.removeSharedUser = async (req, res) => {
  try {
    const { folderId, userId } = req.params;

    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Remove from sharedWith
    folder.sharedWith = folder.sharedWith.filter(
      (share) => share.userId.toString() !== userId
    );

    await folder.save();

    res.json({ message: 'User removed from shared folder', folder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get shared folder details (for users who have access)
exports.getSharedFolderDetail = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id).populate(
      'userId',
      'username email'
    );

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if user is owner or has access
    const hasAccess =
      folder.userId._id.toString() === req.userId.toString() ||
      folder.sharedWith.some(
        (share) => share.userId.toString() === req.userId.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to view this folder' });
    }

    res.json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
