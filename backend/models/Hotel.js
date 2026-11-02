import mongoose from 'mongoose';

/**
 * Hotel Schema
 * Represents hotel properties managed by Hotel Managers.
 * UML Entity: Hotel
 */
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the hotel name'],
      trim: true,
      maxlength: [120, 'Hotel name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide hotel description'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide physical address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      index: true,
    },
    // Strict ownership requirement: Linked to the Hotel Manager who owns this property
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hotel must be assigned to an authorized Hotel Manager'],
      index: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    starRating: {
      type: Number,
      required: [true, 'Please provide star rating'],
      min: [1, 'Star rating must be at least 1'],
      max: [5, 'Star rating cannot exceed 5'],
      default: 3,
      index: true,
    },
    priceStartingFrom: {
      type: Number,
      required: [true, 'Please provide base price per night'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for hotel search & filter queries (city, price range, star rating)
hotelSchema.index({ city: 1, priceStartingFrom: 1, starRating: -1 });
// Text index for name and address search
hotelSchema.index({ name: 'text', city: 'text' });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
