import mongoose from 'mongoose';

/**
 * Destination Schema
 * Represents tourist destinations, cities, attractions and local travel guidance.
 * UML Entity: Destination
 */
const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the destination name'],
      trim: true,
      maxlength: [100, 'Destination name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide the city name'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide the state name'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a destination category'],
      enum: {
        values: [
          'Beaches',
          'Mountains',
          'Temples',
          'Heritage',
          'Wildlife',
          'Hills',
          'Cities',
          'Hill Stations',
          'Waterfalls',
          'Nature and Wildlife',
          'Adventure',
          'Cultural Tourism',
        ],
        message: 'Invalid destination category',
      },
      default: 'Heritage',
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide a primary image URL'],
      trim: true,
    },
    galleryImages: [
      {
        type: String,
        trim: true,
      },
    ],
    // Tourist attractions within this destination
    attractions: [
      {
        name: {
          type: String,
          required: [true, 'Please provide attraction name'],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        imageUrl: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          default: 'Sightseeing',
        },
        location: {
          type: String,
          trim: true,
          default: '',
        },
        visitorInfo: {
          type: String,
          trim: true,
          default: '',
        },
      },
    ],
    bestSeason: {
      type: String,
      trim: true,
      default: 'All Year Round',
    },
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
    visitCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    travelTips: [
      {
        type: String,
        trim: true,
      },
    ],
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Text index on name, city, and state for search queries
destinationSchema.index({ name: 'text', city: 'text', state: 'text' });
// Compound index for category and rating filters
destinationSchema.index({ category: 1, averageRating: -1 });

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
