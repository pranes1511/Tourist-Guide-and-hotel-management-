import mongoose from 'mongoose';

/**
 * Booking Schema
 * Represents hotel room reservations made by Tourists.
 * UML Entity: Booking
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    // The tourist who created this booking
    touristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must be associated with a tourist'],
      index: true,
    },
    // Hotel being reserved
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Booking must reference a hotel'],
      index: true,
    },
    // Specific room type reserved
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Booking must reference a specific room type'],
      index: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Please provide check-in date'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Please provide check-out date'],
      validate: {
        validator: function (value) {
          if (!this.checkIn) return true;
          return new Date(value) > new Date(this.checkIn);
        },
        message: 'Check-out date must be strictly after check-in date',
      },
    },
    guests: {
      type: Number,
      required: [true, 'Please specify number of guests'],
      min: [1, 'At least 1 guest is required'],
      default: 1,
    },
    numberOfNights: {
      type: Number,
      required: [true, 'Number of nights is required'],
      min: [1, 'Number of nights must be at least 1'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price per night cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled', 'completed'],
        message: 'Status must be one of: pending, confirmed, cancelled, completed',
      },
      default: 'pending',
      index: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Critical Compound Index: Enables fast, atomic queries to detect overlapping confirmed room bookings
bookingSchema.index({ roomId: 1, status: 1, checkIn: 1, checkOut: 1 });
// Queries for tourist booking history
bookingSchema.index({ touristId: 1, createdAt: -1 });
// Queries for hotel manager reservation views
bookingSchema.index({ hotelId: 1, status: 1, checkIn: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
