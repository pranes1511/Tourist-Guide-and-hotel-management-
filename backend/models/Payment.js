import mongoose from 'mongoose';

/**
 * Payment Schema
 * Represents financial transactions associated with room bookings.
 * UML Entity: Payment
 *
 * CRITICAL SECURITY ASSURANCE:
 * In accordance with PCI-DSS guidelines and college project specifications,
 * actual credit/debit card numbers, CVVs, and banking passwords are NEVER stored.
 */
const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Payment must reference a booking'],
      unique: true, // One-to-one relationship between confirmed payment and booking
      index: true,
    },
    touristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must reference the paying tourist'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please select a payment method'],
      enum: {
        values: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Simulated Gateway'],
        message: 'Payment method must be Credit Card, Debit Card, UPI, Net Banking, or Simulated Gateway',
      },
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: 'Status must be one of: pending, completed, failed, refunded',
      },
      default: 'pending',
      index: true,
    },
    transactionReference: {
      type: String,
      required: [true, 'Transaction reference is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Query index for user payments
paymentSchema.index({ touristId: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
