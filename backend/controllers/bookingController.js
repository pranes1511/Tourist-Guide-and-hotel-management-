import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import Payment from '../models/Payment.js';
import { checkRoomAvailability } from '../utils/availabilityHelper.js';
import { formatElectronicReceipt } from '../utils/receiptGenerator.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * @desc    Create a new booking reservation (Status: pending until payment)
 * @route   POST /api/bookings
 * @access  Private (Tourist)
 */
export const createBooking = async (req, res, next) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests } = req.body;

    if (!hotelId || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hotelId, roomId, checkIn date, and checkOut date',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after check-in date',
      });
    }

    // 1. Verify room availability
    const availability = await checkRoomAvailability(roomId, checkInDate, checkOutDate);
    if (!availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected room is fully booked for requested dates',
      });
    }

    const room = availability.room;
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const numberOfNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = room.pricePerNight * numberOfNights;
    const bookingReference = `BK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    let booking;

    if (mongoose.connection.readyState === 1) {
      const created = await Booking.create({
        bookingReference,
        touristId: req.user._id,
        hotelId,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests || 1,
        numberOfNights,
        pricePerNight: room.pricePerNight,
        totalAmount,
        status: 'pending',
      });

      booking = await Booking.findById(created._id)
        .populate('hotelId', 'name address city images contactPhone')
        .populate('roomId', 'roomType capacity amenities');
    } else {
      const hotel = memoryStore.hotels.find((h) => h._id === hotelId);
      booking = {
        _id: `book_${Date.now()}`,
        bookingReference,
        touristId: req.user._id,
        hotelId: hotel || { name: 'Hotel', city: 'City' },
        roomId: room || { roomType: 'Room' },
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests || 1,
        numberOfNights,
        pricePerNight: room.pricePerNight,
        totalAmount,
        status: 'pending',
        createdAt: new Date(),
      };
      memoryStore.bookings.push(booking);
    }

    res.status(201).json({
      success: true,
      message: 'Booking initiated successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for the authenticated tourist
 * @route   GET /api/bookings/my
 * @access  Private (Tourist)
 */
export const getMyBookings = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bookings = await Booking.find({ touristId: req.user._id })
        .populate('hotelId', 'name city address images starRating')
        .populate('roomId', 'roomType bedType capacity')
        .sort({ createdAt: -1 });

      const bookingIds = bookings.map((b) => b._id);
      const payments = await Payment.find({ bookingId: { $in: bookingIds } });
      const paymentMap = {};
      payments.forEach((p) => (paymentMap[p.bookingId.toString()] = p));

      const results = bookings.map((b) => ({
        ...b.toObject(),
        payment: paymentMap[b._id.toString()] || null,
      }));

      return res.json({ success: true, count: results.length, data: results });
    }

    // In-Memory Fallback
    const userBookings = memoryStore.bookings.filter(
      (b) => b.touristId.toString() === req.user._id.toString()
    );

    const results = userBookings.map((b) => {
      const hotel = typeof b.hotelId === 'string' ? memoryStore.hotels.find((h) => h._id === b.hotelId) : b.hotelId;
      const room = typeof b.roomId === 'string' ? memoryStore.rooms.find((r) => r._id === b.roomId) : b.roomId;
      const payment = memoryStore.payments.find((p) => p.bookingId === b._id);
      return {
        ...b,
        hotelId: hotel,
        roomId: room,
        payment: payment || null,
      };
    });

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(id)
        .populate('touristId', 'name email phone')
        .populate('hotelId', 'name address city contactPhone contactEmail images')
        .populate('roomId', 'roomType capacity pricePerNight amenities');

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      const payment = await Payment.findOne({ bookingId: booking._id });
      let receipt = null;
      if (payment && payment.paymentStatus === 'completed') {
        receipt = formatElectronicReceipt(booking, payment);
      }

      return res.json({
        success: true,
        data: {
          ...booking.toObject(),
          payment,
          receipt,
        },
      });
    }

    // In-Memory Fallback
    const booking = memoryStore.bookings.find((b) => b._id === id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const hotel = typeof booking.hotelId === 'string' ? memoryStore.hotels.find((h) => h._id === booking.hotelId) : booking.hotelId;
    const room = typeof booking.roomId === 'string' ? memoryStore.rooms.find((r) => r._id === booking.roomId) : booking.roomId;
    const tourist = typeof booking.touristId === 'string' ? memoryStore.users.find((u) => u._id === booking.touristId) : booking.touristId;
    const payment = memoryStore.payments.find((p) => p.bookingId === booking._id);

    const populatedBooking = {
      ...booking,
      hotelId: hotel,
      roomId: room,
      touristId: tourist,
    };

    let receipt = null;
    if (payment && payment.paymentStatus === 'completed') {
      receipt = formatElectronicReceipt(populatedBooking, payment);
    }

    res.json({
      success: true,
      data: {
        ...populatedBooking,
        payment,
        receipt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an eligible booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      booking.status = 'cancelled';
      booking.cancellationReason = req.body.reason || 'User cancelled';
      booking.cancelledAt = new Date();
      await booking.save();

      const payment = await Payment.findOne({ bookingId: booking._id });
      if (payment) {
        payment.paymentStatus = 'refunded';
        await payment.save();
      }

      return res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
    }

    const booking = memoryStore.bookings.find((b) => b._id === id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled';
    booking.cancelledAt = new Date();

    const payment = memoryStore.payments.find((p) => p.bookingId === id);
    if (payment) payment.paymentStatus = 'refunded';

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    next(error);
  }
};
