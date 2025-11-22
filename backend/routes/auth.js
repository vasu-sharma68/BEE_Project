const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('username', 'Username is required').notEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({
      min: 6,
    }),
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  authController.login
);

// Get profile
router.get('/profile', auth, authController.getProfile);

// Update profile
router.put('/profile', auth, authController.updateProfile);

// Delete account
router.delete('/account', auth, authController.deleteAccount);

module.exports = router;
