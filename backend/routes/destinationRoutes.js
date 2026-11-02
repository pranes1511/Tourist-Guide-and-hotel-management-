import express from 'express';
import {
  getDestinations,
  getDestinationById,
  getDestinationCategories,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destinationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/categories', getDestinationCategories);
router.get('/', getDestinations);
router.get('/:id', getDestinationById);

// Manager-only modification routes
router.post('/', protect, authorize('manager'), createDestination);
router.put('/:id', protect, authorize('manager'), updateDestination);
router.delete('/:id', protect, authorize('manager'), deleteDestination);

export default router;
