import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import memoryStore from './memoryStore.js';

/**
 * Checks room availability for a given date range and prevents double bookings
 * Works reliably with MongoDB and in-memory fallback.
 */
export const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new Error('Invalid date format provided');
  }

  if (checkOutDate <= checkInDate) {
    throw new Error('Check-out date must be strictly after check-in date');
  }

  let room;
  let overlappingCount = 0;

  if (mongoose.connection.readyState === 1) {
    room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');

    overlappingCount = await Booking.countDocuments({
      roomId: room._id,
      status: 'confirmed',
      $and: [
        { checkIn: { $lt: checkOutDate } },
        { checkOut: { $gt: checkInDate } },
      ],
    });
  } else {
    room = memoryStore.rooms.find((r) => r._id === roomId);
    if (!room) throw new Error('Room not found');

    overlappingCount = memoryStore.bookings.filter(
      (b) =>
        b.roomId === roomId &&
        b.status === 'confirmed' &&
        new Date(b.checkIn) < checkOutDate &&
        new Date(b.checkOut) > checkInDate
    ).length;
  }

  const availableRooms = Math.max(0, room.totalRooms - overlappingCount);

  return {
    isAvailable: availableRooms > 0 && room.isAvailable,
    availableRooms,
    totalRooms: room.totalRooms,
    room,
  };
};
