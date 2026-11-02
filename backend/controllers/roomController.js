import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import { checkRoomAvailability } from '../utils/availabilityHelper.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * @desc    Get all rooms for a hotel
 * @route   GET /api/rooms/hotel/:hotelId
 * @access  Public
 */
export const getRoomsByHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut } = req.query;

    let rooms;
    if (mongoose.connection.readyState === 1) {
      rooms = await Room.find({ hotelId });
    } else {
      rooms = memoryStore.rooms.filter((r) => r.hotelId === hotelId);
    }

    if (checkIn && checkOut) {
      const roomsWithAvailability = await Promise.all(
        rooms.map(async (room) => {
          try {
            const avail = await checkRoomAvailability(room._id, checkIn, checkOut);
            return {
              ...(room.toObject ? room.toObject() : room),
              isAvailableForDates: avail.isAvailable,
              availableRoomsCount: avail.availableRooms,
            };
          } catch (err) {
            return {
              ...(room.toObject ? room.toObject() : room),
              isAvailableForDates: room.isAvailable,
              availableRoomsCount: room.totalRooms,
            };
          }
        })
      );

      return res.json({
        success: true,
        count: roomsWithAvailability.length,
        data: roomsWithAvailability,
      });
    }

    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check room availability for specific dates
 * @route   POST /api/rooms/check-availability
 * @access  Public
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomId, checkIn, and checkOut dates',
      });
    }

    const result = await checkRoomAvailability(roomId, checkIn, checkOut);

    res.json({
      success: true,
      data: {
        roomId,
        roomType: result.room.roomType,
        isAvailable: result.isAvailable,
        availableRooms: result.availableRooms,
        totalRooms: result.totalRooms,
        pricePerNight: result.room.pricePerNight,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new room type for a hotel
 * @route   POST /api/rooms
 * @access  Private (Hotel Manager)
 */
export const createRoom = async (req, res, next) => {
  try {
    const { hotelId, roomType, pricePerNight, capacity, totalRooms, amenities, description, bedType } = req.body;

    if (mongoose.connection.readyState === 1) {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
      if (hotel.managerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const room = await Room.create({
        hotelId,
        roomType,
        pricePerNight,
        capacity,
        totalRooms: totalRooms || 5,
        bedType: bedType || 'King Bed',
        amenities: amenities || [],
        description: description || '',
      });
      return res.status(201).json({ success: true, message: 'Room created', data: room });
    }

    const room = {
      _id: `room_${Date.now()}`,
      hotelId,
      roomType,
      pricePerNight,
      capacity,
      totalRooms: totalRooms || 5,
      bedType: bedType || 'King Bed',
      amenities: amenities || [],
      description: description || '',
      isAvailable: true,
      createdAt: new Date(),
    };
    memoryStore.rooms.push(room);

    res.status(201).json({ success: true, message: 'Room created', data: room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update room details
 * @route   PUT /api/rooms/:id
 * @access  Private (Hotel Manager)
 */
export const updateRoom = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({ success: true, message: 'Room updated', data: updated });
    }

    const room = memoryStore.rooms.find((r) => r._id === req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    Object.assign(room, req.body);
    res.json({ success: true, message: 'Room updated', data: room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 * @access  Private (Hotel Manager)
 */
export const deleteRoom = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Room.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Room deleted' });
    }

    const idx = memoryStore.rooms.findIndex((r) => r._id === req.params.id);
    if (idx !== -1) memoryStore.rooms.splice(idx, 1);

    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};
