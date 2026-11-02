import express from 'express';
import {
  getRoomsByHotel,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/hotel/:hotelId', getRoomsByHotel);
router.post('/check-availability', checkAvailability);

// Manager-only room inventory management
router.post('/', protect, authorize('manager'), createRoom);
router.put('/:id', protect, authorize('manager'), updateRoom);
router.delete('/:id', protect, authorize('manager'), deleteRoom);

export default router;
