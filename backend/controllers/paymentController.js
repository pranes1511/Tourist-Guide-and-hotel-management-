import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { checkRoomAvailability } from '../utils/availabilityHelper.js';
import { formatElectronicReceipt } from '../utils/receiptGenerator.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * @desc    Process simulated payment and confirm reservation
 * @route   POST /api/payments
 * @access  Private (Tourist)
 */
export const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and paymentMethod',
      });
    }

    const transactionReference = `TXN-SIM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(bookingId)
        .populate('hotelId')
        .populate('roomId')
        .populate('touristId');

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.status === 'confirmed') {
        return res.status(400).json({ success: false, message: 'Already paid and confirmed' });
      }

      // Re-verify room availability before payment confirmation
      const availability = await checkRoomAvailability(booking.roomId._id, booking.checkIn, booking.checkOut);
      if (!availability.isAvailable) {
        return res.status(400).json({ success: false, message: 'Room is no longer available' });
      }

      const payment = await Payment.create({
        bookingId: booking._id,
        touristId: req.user._id,
        amount: booking.totalAmount,
        currency: 'INR',
        paymentMethod,
        paymentStatus: 'completed',
        transactionReference,
        receiptNumber,
        paidAt: new Date(),
      });

      booking.status = 'confirmed';
      await booking.save();

      const pointsEarned = Math.max(10, Math.round(booking.totalAmount * 0.05));
      await User.findByIdAndUpdate(req.user._id, { $inc: { rewardPoints: pointsEarned } });

      const receipt = formatElectronicReceipt(booking, payment);

      return res.status(201).json({
        success: true,
        message: 'Payment processed successfully. Reservation confirmed!',
        data: { payment, receipt, pointsEarned },
      });
    }

    // In-Memory Fallback
    const booking = memoryStore.bookings.find((b) => b._id === bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'confirmed';

    const hotel = typeof booking.hotelId === 'string' ? memoryStore.hotels.find((h) => h._id === booking.hotelId) : booking.hotelId;
    const room = typeof booking.roomId === 'string' ? memoryStore.rooms.find((r) => r._id === booking.roomId) : booking.roomId;
    const tourist = typeof booking.touristId === 'string' ? memoryStore.users.find((u) => u._id === booking.touristId) : booking.touristId;

    const payment = {
      _id: `pay_${Date.now()}`,
      bookingId: booking._id,
      touristId: req.user._id,
      amount: booking.totalAmount,
      currency: 'INR',
      paymentMethod,
      paymentStatus: 'completed',
      transactionReference,
      receiptNumber,
      paidAt: new Date(),
      createdAt: new Date(),
    };
    memoryStore.payments.push(payment);

    const populatedBooking = { ...booking, hotelId: hotel, roomId: room, touristId: tourist };
    const receipt = formatElectronicReceipt(populatedBooking, payment);

    const pointsEarned = Math.max(10, Math.round(booking.totalAmount * 0.05));
    const user = memoryStore.users.find((u) => u._id === req.user._id);
    if (user) user.rewardPoints = (user.rewardPoints || 0) + pointsEarned;

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully. Reservation confirmed!',
      data: { payment, receipt, pointsEarned },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get electronic receipt for a booking
 * @route   GET /api/payments/:bookingId
 * @access  Private
 */
export const getPaymentReceipt = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(bookingId)
        .populate('hotelId')
        .populate('roomId')
        .populate('touristId');

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      const payment = await Payment.findOne({ bookingId: booking._id });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

      const receipt = formatElectronicReceipt(booking, payment);
      return res.json({ success: true, data: receipt });
    }

    // In-Memory Fallback
    const booking = memoryStore.bookings.find((b) => b._id === bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const payment = memoryStore.payments.find((p) => p.bookingId === bookingId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    const hotel = typeof booking.hotelId === 'string' ? memoryStore.hotels.find((h) => h._id === booking.hotelId) : booking.hotelId;
    const room = typeof booking.roomId === 'string' ? memoryStore.rooms.find((r) => r._id === booking.roomId) : booking.roomId;
    const tourist = typeof booking.touristId === 'string' ? memoryStore.users.find((u) => u._id === booking.touristId) : booking.touristId;

    const populatedBooking = { ...booking, hotelId: hotel, roomId: room, touristId: tourist };
    const receipt = formatElectronicReceipt(populatedBooking, payment);

    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};
