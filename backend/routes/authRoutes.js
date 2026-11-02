import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  toggleFavoriteDestination,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateUserProfile);
router.post('/favorites/:destinationId', protect, toggleFavoriteDestination);

export default router;
