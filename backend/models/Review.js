import mongoose from 'mongoose';

/**
 * Review Schema
 * Represents user ratings and reviews for Hotels and Destinations.
 * UML Entity: Review
 */
const reviewSchema = new mongoose.Schema(
  {
    touristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must be associated with a registered tourist'],
      index: true,
    },
    targetType: {
      type: String,
      required: [true, 'Target type must be specified (Hotel or Destination)'],
      enum: {
        values: ['Hotel', 'Destination'],
        message: 'targetType must be either Hotel or Destination',
      },
      index: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      default: null,
      index: true,
      validate: {
        validator: function (val) {
          if (this.targetType === 'Hotel') {
            return !!val;
          }
          return true;
        },
        message: 'hotelId is required when reviewing a Hotel',
      },
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
      index: true,
      validate: {
        validator: function (val) {
          if (this.targetType === 'Destination') {
            return !!val;
          }
          return true;
        },
        message: 'destinationId is required when reviewing a Destination',
      },
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment text'],
      trim: true,
      minlength: [5, 'Review comment must be at least 5 characters'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast retrieval by hotel or destination
reviewSchema.index({ hotelId: 1, createdAt: -1 });
reviewSchema.index({ destinationId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
