import express from 'express';
import {
  createReview,
  getHotelReviews,
  getDestinationReviews,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/hotel/:hotelId', getHotelReviews);
router.get('/destination/:destinationId', getDestinationReviews);

export default router;
