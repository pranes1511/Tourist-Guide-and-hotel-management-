import express from 'express';
import { processPayment, getPaymentReceipt } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, processPayment);
router.get('/:bookingId', protect, getPaymentReceipt);

export default router;
