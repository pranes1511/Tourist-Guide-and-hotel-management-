import express from 'express';
import {
  getManagerDashboard,
  getManagerHotels,
  getManagerBookings,
  updateBookingStatus,
} from '../controllers/managerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All manager routes require both authentication and 'manager' role
router.use(protect);
router.use(authorize('manager'));

router.get('/dashboard', getManagerDashboard);
router.get('/hotels', getManagerHotels);
router.get('/bookings', getManagerBookings);
router.put('/bookings/:id/status', updateBookingStatus);

export default router;
