import mongoose from 'mongoose';

/**
 * Room Schema
 * Represents room types and inventory for a specific hotel.
 * Supporting entity for Hotel, Booking, and availability checking.
 */
const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Room must be associated with a valid Hotel'],
      index: true,
    },
    roomType: {
      type: String,
      required: [true, 'Please provide room type'],
      enum: {
        values: [
          'Standard Room',
          'Deluxe Room',
          'Executive Suite',
          'Family Suite',
          'Presidential Suite',
        ],
        message: 'Room type must be one of: Standard Room, Deluxe Room, Executive Suite, Family Suite, Presidential Suite',
      },
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide price per night'],
      min: [0, 'Price per night cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify maximum guest capacity'],
      min: [1, 'Capacity must be at least 1 guest'],
      default: 2,
    },
    bedType: {
      type: String,
      trim: true,
      default: 'King Bed',
    },
    // Total rooms of this type available at the hotel
    totalRooms: {
      type: Number,
      required: [true, 'Please specify total rooms inventory'],
      min: [1, 'Total rooms must be at least 1'],
      default: 5,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a hotel doesn't have duplicate room types defined
roomSchema.index({ hotelId: 1, roomType: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
