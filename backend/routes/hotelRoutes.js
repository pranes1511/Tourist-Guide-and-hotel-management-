import express from 'express';
import {
  getHotels,
  getHotelById,
  compareHotels,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/compare', compareHotels);
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Manager-only hotel listing endpoints
router.post('/', protect, authorize('manager'), createHotel);
router.put('/:id', protect, authorize('manager'), updateHotel);
router.delete('/:id', protect, authorize('manager'), deleteHotel);

export default router;
