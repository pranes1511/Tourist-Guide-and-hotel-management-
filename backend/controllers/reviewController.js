import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Hotel from '../models/Hotel.js';
import Destination from '../models/Destination.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * Recalculate average rating for a Hotel or Destination
 */
const recalculateAverageRating = async (targetType, targetId) => {
  if (mongoose.connection.readyState === 1) {
    const filter = targetType === 'Hotel' ? { hotelId: targetId } : { destinationId: targetId };
    const reviews = await Review.find(filter);
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    if (targetType === 'Hotel') {
      await Hotel.findByIdAndUpdate(targetId, { averageRating, totalReviews });
    } else {
      await Destination.findByIdAndUpdate(targetId, { averageRating, totalReviews });
    }
  } else {
    const filterKey = targetType === 'Hotel' ? 'hotelId' : 'destinationId';
    const reviews = memoryStore.reviews.filter((r) => r[filterKey] === targetId);
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    if (targetType === 'Hotel') {
      const h = memoryStore.hotels.find((item) => item._id === targetId);
      if (h) {
        h.averageRating = averageRating;
        h.totalReviews = totalReviews;
      }
    } else {
      const d = memoryStore.destinations.find((item) => item._id === targetId);
      if (d) {
        d.averageRating = averageRating;
        d.totalReviews = totalReviews;
      }
    }
  }
};

/**
 * @desc    Submit a review for a Hotel or Destination
 * @route   POST /api/reviews
 * @access  Private (Tourist)
 */
export const createReview = async (req, res, next) => {
  try {
    const { targetType, hotelId, destinationId, rating, title, comment } = req.body;

    if (!targetType || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide targetType, rating, and review comment',
      });
    }

    if (targetType === 'Hotel' && !hotelId) {
      return res.status(400).json({ success: false, message: 'hotelId is required' });
    }
    if (targetType === 'Destination' && !destinationId) {
      return res.status(400).json({ success: false, message: 'destinationId is required' });
    }

    if (mongoose.connection.readyState === 1) {
      const review = await Review.create({
        touristId: req.user._id,
        targetType,
        hotelId: targetType === 'Hotel' ? hotelId : null,
        destinationId: targetType === 'Destination' ? destinationId : null,
        rating: Number(rating),
        title: title || '',
        comment,
      });

      await recalculateAverageRating(targetType, targetType === 'Hotel' ? hotelId : destinationId);
      const populated = await Review.findById(review._id).populate('touristId', 'name avatar');
      return res.status(201).json({ success: true, message: 'Review submitted successfully', data: populated });
    }

    // In-Memory Fallback
    const targetId = targetType === 'Hotel' ? hotelId : destinationId;
    const review = {
      _id: `rev_${Date.now()}`,
      touristId: req.user._id,
      targetType,
      hotelId: targetType === 'Hotel' ? hotelId : null,
      destinationId: targetType === 'Destination' ? destinationId : null,
      rating: Number(rating),
      title: title || '',
      comment,
      createdAt: new Date(),
    };
    memoryStore.reviews.push(review);

    await recalculateAverageRating(targetType, targetId);

    const user = memoryStore.users.find((u) => u._id === req.user._id);
    const populated = {
      ...review,
      touristId: user ? { _id: user._id, name: user.name } : { name: 'Verified Tourist' },
    };

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific hotel
 * @route   GET /api/reviews/hotel/:hotelId
 * @access  Public
 */
export const getHotelReviews = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const reviews = await Review.find({ hotelId })
        .populate('touristId', 'name avatar')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: reviews.length, data: reviews });
    }

    const reviews = memoryStore.reviews
      .filter((r) => r.hotelId === hotelId)
      .map((r) => {
        const tourist = memoryStore.users.find((u) => u._id === r.touristId);
        return {
          ...r,
          touristId: tourist ? { _id: tourist._id, name: tourist.name } : { name: 'Verified Guest' },
        };
      });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific destination
 * @route   GET /api/reviews/destination/:destinationId
 * @access  Public
 */
export const getDestinationReviews = async (req, res, next) => {
  try {
    const { destinationId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const reviews = await Review.find({ destinationId })
        .populate('touristId', 'name avatar')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: reviews.length, data: reviews });
    }

    const reviews = memoryStore.reviews
      .filter((r) => r.destinationId === destinationId)
      .map((r) => {
        const tourist = memoryStore.users.find((u) => u._id === r.touristId);
        return {
          ...r,
          touristId: tourist ? { _id: tourist._id, name: tourist.name } : { name: 'Verified Tourist' },
        };
      });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};
