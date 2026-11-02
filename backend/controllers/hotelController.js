import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';
import Destination from '../models/Destination.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * @desc    Search and filter hotels by city, price range, star rating, and amenities
 * @route   GET /api/hotels
 * @access  Public
 */
export const getHotels = async (req, res, next) => {
  try {
    const { city, search, minPrice, maxPrice, starRating, amenities, sort } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { isActive: true };
      if (city && city !== 'All') query.city = { $regex: city, $options: 'i' };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
        ];
      }
      if (starRating && starRating !== 'All') query.starRating = { $gte: Number(starRating) };
      if (minPrice || maxPrice) {
        query.priceStartingFrom = {};
        if (minPrice) query.priceStartingFrom.$gte = Number(minPrice);
        if (maxPrice) query.priceStartingFrom.$lte = Number(maxPrice);
      }
      if (amenities) {
        const amenitiesList = amenities.split(',').map((a) => a.trim());
        query.amenities = { $all: amenitiesList };
      }

      let sortOption = { averageRating: -1, priceStartingFrom: 1 };
      if (sort === 'price_asc') sortOption = { priceStartingFrom: 1 };
      else if (sort === 'price_desc') sortOption = { priceStartingFrom: -1 };
      else if (sort === 'rating') sortOption = { averageRating: -1 };

      const hotels = await Hotel.find(query).sort(sortOption);
      return res.json({ success: true, count: hotels.length, data: hotels });
    }

    // In-Memory Fallback Filter
    let results = [...memoryStore.hotels.filter((h) => h.isActive)];

    if (city && city !== 'All') {
      results = results.filter((h) => h.city.toLowerCase() === city.toLowerCase());
    }

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (h) =>
          h.name.toLowerCase().includes(term) ||
          h.address.toLowerCase().includes(term) ||
          h.city.toLowerCase().includes(term)
      );
    }

    if (starRating && starRating !== 'All') {
      results = results.filter((h) => h.starRating >= Number(starRating));
    }

    if (minPrice) {
      results = results.filter((h) => h.priceStartingFrom >= Number(minPrice));
    }

    if (maxPrice) {
      results = results.filter((h) => h.priceStartingFrom <= Number(maxPrice));
    }

    if (amenities) {
      const amenitiesList = amenities.split(',').map((a) => a.trim().toLowerCase());
      results = results.filter((h) =>
        amenitiesList.every((reqA) =>
          h.amenities?.some((hotelA) => hotelA.toLowerCase().includes(reqA))
        )
      );
    }

    if (sort === 'price_asc') {
      results.sort((a, b) => a.priceStartingFrom - b.priceStartingFrom);
    } else if (sort === 'price_desc') {
      results.sort((a, b) => b.priceStartingFrom - a.priceStartingFrom);
    } else {
      results.sort((a, b) => b.averageRating - a.averageRating);
    }

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
 * @desc    Get single hotel by ID with room types and reviews
 * @route   GET /api/hotels/:id
 * @access  Public
 */
export const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const hotel = await Hotel.findById(id)
        .populate('managerId', 'name email phone')
        .populate('destinationId', 'name city state');

      if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

      const rooms = await Room.find({ hotelId: hotel._id, isAvailable: true }).sort({
        pricePerNight: 1,
      });

      const reviews = await Review.find({ hotelId: hotel._id })
        .populate('touristId', 'name avatar')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: {
          ...hotel.toObject(),
          rooms,
          reviews,
        },
      });
    }

    // In-Memory Fallback
    const hotel = memoryStore.hotels.find((h) => h._id === id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    const rooms = memoryStore.rooms.filter((r) => r.hotelId === hotel._id && r.isAvailable);
    const reviews = memoryStore.reviews
      .filter((r) => r.hotelId === hotel._id)
      .map((r) => {
        const tourist = memoryStore.users.find((u) => u._id === r.touristId);
        return {
          ...r,
          touristId: tourist ? { _id: tourist._id, name: tourist.name } : { name: 'Verified Guest' },
        };
      });

    res.json({
      success: true,
      data: {
        ...hotel,
        rooms,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compare 2 to 3 hotels side by side
 * @route   GET /api/hotels/compare?ids=id1,id2,id3
 * @access  Public
 */
export const compareHotels = async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comma-separated hotel IDs to compare',
      });
    }

    const hotelIds = ids.split(',').map((id) => id.trim());

    if (mongoose.connection.readyState === 1) {
      const hotels = await Hotel.find({ _id: { $in: hotelIds } });
      const hotelsWithRooms = await Promise.all(
        hotels.map(async (hotel) => {
          const rooms = await Room.find({ hotelId: hotel._id, isAvailable: true });
          return { ...hotel.toObject(), rooms };
        })
      );
      return res.json({ success: true, count: hotelsWithRooms.length, data: hotelsWithRooms });
    }

    // In-Memory Fallback
    const matchedHotels = memoryStore.hotels.filter((h) => hotelIds.includes(h._id));
    const results = matchedHotels.map((h) => {
      const rooms = memoryStore.rooms.filter((r) => r.hotelId === h._id && r.isAvailable);
      return { ...h, rooms };
    });

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
 * @desc    Create a new hotel listing (Assigned to logged-in Hotel Manager)
 * @route   POST /api/hotels
 * @access  Private (Hotel Manager)
 */
export const createHotel = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const hotel = await Hotel.create({
        ...req.body,
        managerId: req.user._id,
      });
      return res.status(201).json({ success: true, message: 'Hotel listing created', data: hotel });
    }

    const hotel = {
      _id: `hotel_${Date.now()}`,
      ...req.body,
      managerId: req.user._id,
      averageRating: 5.0,
      totalReviews: 1,
      isActive: true,
      createdAt: new Date(),
    };
    memoryStore.hotels.push(hotel);

    res.status(201).json({ success: true, message: 'Hotel listing created', data: hotel });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hotel details (Manager must own the hotel)
 * @route   PUT /api/hotels/:id
 * @access  Private (Hotel Manager)
 */
export const updateHotel = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const hotel = await Hotel.findById(req.params.id);
      if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
      if (hotel.managerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this hotel' });
      }

      const updated = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({ success: true, message: 'Hotel updated', data: updated });
    }

    const hotel = memoryStore.hotels.find((h) => h._id === req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    Object.assign(hotel, req.body);
    res.json({ success: true, message: 'Hotel updated', data: hotel });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete hotel listing (Manager must own the hotel)
 * @route   DELETE /api/hotels/:id
 * @access  Private (Hotel Manager)
 */
export const deleteHotel = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const hotel = await Hotel.findById(req.params.id);
      if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
      if (hotel.managerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      await Room.deleteMany({ hotelId: hotel._id });
      await hotel.deleteOne();
      return res.json({ success: true, message: 'Hotel deleted successfully' });
    }

    const idx = memoryStore.hotels.findIndex((h) => h._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Hotel not found' });

    memoryStore.hotels.splice(idx, 1);
    memoryStore.rooms = memoryStore.rooms.filter((r) => r.hotelId !== req.params.id);

    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    next(error);
  }
};
