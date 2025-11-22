const express = require('express');
const { body } = require('express-validator');
const folderController = require('../controllers/folderController');
const auth = require('../middleware/auth');

const router = express.Router();

// Create folder
router.post(
  '/',
  auth,
  [body('name', 'Folder name is required').notEmpty()],
  folderController.createFolder
);

// Get all folders
router.get('/', auth, folderController.getFolders);

// Get single folder
router.get('/:id', auth, folderController.getFolder);

// Update folder
router.put('/:id', auth, folderController.updateFolder);

// Delete folder
router.delete('/:id', auth, folderController.deleteFolder);

// Share folder with another user
router.post('/:id/share', auth, folderController.shareFolder);

// Get folders shared with current user
router.get('/shared/all', auth, folderController.getSharedFolders);

// Get shared folder details
router.get('/shared/:id', auth, folderController.getSharedFolderDetail);

// Remove user from shared folder
router.delete('/:folderId/share/:userId', auth, folderController.removeSharedUser);

module.exports = router;
