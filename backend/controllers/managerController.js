import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * @desc    Get dashboard metrics for the authenticated Hotel Manager
 * @route   GET /api/manager/dashboard
 * @access  Private (Hotel Manager)
 */
export const getManagerDashboard = async (req, res, next) => {
  try {
    const managerId = req.user._id;

    if (mongoose.connection.readyState === 1) {
      const managerHotels = await Hotel.find({ managerId });
      const hotelIds = managerHotels.map((h) => h._id);

      const totalRooms = await Room.countDocuments({ hotelId: { $in: hotelIds } });
      const totalBookings = await Booking.countDocuments({ hotelId: { $in: hotelIds } });
      const confirmedBookings = await Booking.countDocuments({
        hotelId: { $in: hotelIds },
        status: 'confirmed',
      });

      const confirmedDocs = await Booking.find({
        hotelId: { $in: hotelIds },
        status: 'confirmed',
      });
      const totalRevenue = confirmedDocs.reduce((acc, b) => acc + b.totalAmount, 0);

      const recentBookings = await Booking.find({ hotelId: { $in: hotelIds } })
        .populate('touristId', 'name email phone')
        .populate('hotelId', 'name city')
        .populate('roomId', 'roomType')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.json({
        success: true,
        data: {
          stats: {
            totalHotels: managerHotels.length,
            totalRooms,
            totalBookings,
            confirmedBookings,
            totalRevenue,
          },
          hotels: managerHotels,
          recentBookings,
        },
      });
    }

    // In-Memory Fallback
    const managerHotels = memoryStore.hotels.filter(
      (h) => h.managerId === managerId || managerId.toString().includes('user_')
    );
    const hotelIds = managerHotels.map((h) => h._id);

    const totalRooms = memoryStore.rooms.filter((r) => hotelIds.includes(r.hotelId)).length;
    const totalBookings = memoryStore.bookings.length;
    const confirmedBookings = memoryStore.bookings.filter((b) => b.status === 'confirmed').length;
    const totalRevenue = memoryStore.bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    const recentBookings = memoryStore.bookings.slice(0, 5).map((b) => {
      const tourist = memoryStore.users.find((u) => u._id === b.touristId);
      const hotel = memoryStore.hotels.find((h) => h._id === (b.hotelId?._id || b.hotelId));
      const room = memoryStore.rooms.find((r) => r._id === (b.roomId?._id || b.roomId));
      return {
        ...b,
        touristId: tourist || { name: 'Guest' },
        hotelId: hotel || { name: 'Hotel' },
        roomId: room || { roomType: 'Room' },
      };
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalHotels: managerHotels.length,
          totalRooms,
          totalBookings,
          confirmedBookings,
          totalRevenue,
        },
        hotels: managerHotels,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all hotels owned by the authenticated Hotel Manager
 * @route   GET /api/manager/hotels
 * @access  Private (Hotel Manager)
 */
export const getManagerHotels = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const hotels = await Hotel.find({ managerId: req.user._id })
        .populate('destinationId', 'name city state')
        .sort({ createdAt: -1 });

      const hotelsWithRoomsCount = await Promise.all(
        hotels.map(async (h) => {
          const roomCount = await Room.countDocuments({ hotelId: h._id });
          return { ...h.toObject(), roomCount };
        })
      );
      return res.json({ success: true, count: hotelsWithRoomsCount.length, data: hotelsWithRoomsCount });
    }

    // In-Memory Fallback
    const hotels = memoryStore.hotels.map((h) => {
      const roomCount = memoryStore.rooms.filter((r) => r.hotelId === h._id).length;
      return { ...h, roomCount };
    });

    res.json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all guest reservations across manager's hotels
 * @route   GET /api/manager/bookings
 * @access  Private (Hotel Manager)
 */
export const getManagerBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (mongoose.connection.readyState === 1) {
      const managerHotels = await Hotel.find({ managerId: req.user._id });
      const hotelIds = managerHotels.map((h) => h._id);

      const filter = { hotelId: { $in: hotelIds } };
      if (status && status !== 'all') filter.status = status;

      const bookings = await Booking.find(filter)
        .populate('touristId', 'name email phone')
        .populate('hotelId', 'name city address')
        .populate('roomId', 'roomType capacity pricePerNight')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: bookings.length, data: bookings });
    }

    // In-Memory Fallback
    let bookings = [...memoryStore.bookings];
    if (status && status !== 'all') {
      bookings = bookings.filter((b) => b.status === status);
    }

    const populated = bookings.map((b) => {
      const tourist = memoryStore.users.find((u) => u._id === (b.touristId?._id || b.touristId));
      const hotel = memoryStore.hotels.find((h) => h._id === (b.hotelId?._id || b.hotelId));
      const room = memoryStore.rooms.find((r) => r._id === (b.roomId?._id || b.roomId));
      return {
        ...b,
        touristId: tourist || { name: 'Guest', phone: '+91 98765 43210' },
        hotelId: hotel || { name: 'Hotel', city: 'Panaji' },
        roomId: room || { roomType: 'Deluxe Room' },
      };
    });

    res.json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update reservation status by Hotel Manager
 * @route   PUT /api/manager/bookings/:id/status
 * @access  Private (Hotel Manager)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      booking.status = status;
      await booking.save();
      return res.json({ success: true, message: `Booking status updated to ${status}`, data: booking });
    }

    const booking = memoryStore.bookings.find((b) => b._id === id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    res.json({ success: true, message: `Booking status updated to ${status}`, data: booking });
  } catch (error) {
    next(error);
  }
};
