import mongoose from 'mongoose';
import Destination from '../models/Destination.js';
import Hotel from '../models/Hotel.js';
import Review from '../models/Review.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * @desc    Get all destinations with search & category filters
 * @route   GET /api/destinations
 * @access  Public
 */
export const getDestinations = async (req, res, next) => {
  try {
    const { search, category, state, sort } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { 'attractions.name': { $regex: search, $options: 'i' } },
        ];
      }
      if (category && category !== 'All') query.category = category;
      if (state && state !== 'All') query.state = state;

      let sortOption = { averageRating: -1, visitCount: -1 };
      if (sort === 'popular') sortOption = { visitCount: -1 };
      else if (sort === 'name') sortOption = { name: 1 };
      else if (sort === 'rating') sortOption = { averageRating: -1 };

      const destinations = await Destination.find(query).sort(sortOption);
      return res.json({ success: true, count: destinations.length, data: destinations });
    }

    // In-Memory Fallback Filter
    let results = [...memoryStore.destinations];

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.city.toLowerCase().includes(term) ||
          d.state.toLowerCase().includes(term) ||
          (d.attractions && d.attractions.some((a) => a.name.toLowerCase().includes(term)))
      );
    }

    if (category && category !== 'All') {
      results = results.filter((d) => d.category.toLowerCase() === category.toLowerCase());
    }

    if (state && state !== 'All') {
      results = results.filter((d) => d.state.toLowerCase() === state.toLowerCase());
    }

    if (sort === 'popular') {
      results.sort((a, b) => b.visitCount - a.visitCount);
    } else if (sort === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
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
 * @desc    Get single destination by ID with attractions, nearby hotels & reviews
 * @route   GET /api/destinations/:id
 * @access  Public
 */
export const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const destination = await Destination.findById(id);
      if (!destination) {
        return res.status(404).json({ success: false, message: 'Destination not found' });
      }

      destination.visitCount += 1;
      await destination.save({ validateBeforeSave: false });

      const nearbyHotels = await Hotel.find({ city: destination.city, isActive: true })
        .select('name starRating priceStartingFrom images amenities averageRating totalReviews')
        .limit(6);

      const reviews = await Review.find({ destinationId: destination._id })
        .populate('touristId', 'name avatar')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: {
          ...destination.toObject(),
          nearbyHotels,
          reviews,
        },
      });
    }

    // In-Memory Fallback
    const destination = memoryStore.destinations.find((d) => d._id === id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    destination.visitCount = (destination.visitCount || 0) + 1;

    const nearbyHotels = memoryStore.hotels
      .filter((h) => h.city.toLowerCase() === destination.city.toLowerCase() && h.isActive)
      .slice(0, 6);

    const reviews = memoryStore.reviews
      .filter((r) => r.destinationId === destination._id)
      .map((r) => {
        const tourist = memoryStore.users.find((u) => u._id === r.touristId);
        return {
          ...r,
          touristId: tourist ? { _id: tourist._id, name: tourist.name } : { name: 'Verified Tourist' },
        };
      });

    res.json({
      success: true,
      data: {
        ...destination,
        nearbyHotels,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of unique destination categories
 * @route   GET /api/destinations/categories
 * @access  Public
 */
export const getDestinationCategories = async (req, res, next) => {
  try {
    const categories = [
      { name: 'Hill Stations', icon: 'Sunrise', description: 'Serene misty peaks and lush valleys' },
      { name: 'Temples', icon: 'Church', description: 'Sacred Dravidian shrines & spiritual architecture' },
      { name: 'Heritage', icon: 'Landmark', description: 'Living Chola temples, forts & royal monuments' },
      { name: 'Beaches', icon: 'Waves', description: 'Sun-kissed coastal shores & oceanside promenades' },
      { name: 'Waterfalls', icon: 'Droplets', description: 'Cascading natural falls and forest river baths' },
      { name: 'Nature and Wildlife', icon: 'Trees', description: 'Biosphere reserves, mangroves & sanctuaries' },
      { name: 'Adventure', icon: 'Compass', description: 'Hairpin bends, coracle rafting & hill treks' },
      { name: 'Cultural Tourism', icon: 'Sparkles', description: 'Silk weaving, classical arts & memorials' },
      { name: 'Mountains', icon: 'Mountain', description: 'Snowy peaks and alpine valleys' },
      { name: 'Hills', icon: 'Sunrise', description: 'Cool tea plantations and hill trails' },
      { name: 'Wildlife', icon: 'Trees', description: 'National parks and nature sanctuaries' },
      { name: 'Cities', icon: 'Building2', description: 'Vibrant metropolitan cultural hubs' },
    ];

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new destination
 * @route   POST /api/destinations
 * @access  Private (Hotel Manager)
 */
export const createDestination = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const destination = await Destination.create(req.body);
      return res.status(201).json({ success: true, message: 'Destination created', data: destination });
    }

    const destination = {
      _id: `dest_${Date.now()}`,
      ...req.body,
      createdAt: new Date(),
    };
    memoryStore.destinations.push(destination);

    res.status(201).json({ success: true, message: 'Destination created', data: destination });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing destination
 * @route   PUT /api/destinations/:id
 * @access  Private (Hotel Manager)
 */
export const updateDestination = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
      return res.json({ success: true, message: 'Destination updated', data: destination });
    }

    const idx = memoryStore.destinations.findIndex((d) => d._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Destination not found' });

    memoryStore.destinations[idx] = { ...memoryStore.destinations[idx], ...req.body };
    res.json({ success: true, message: 'Destination updated', data: memoryStore.destinations[idx] });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a destination
 * @route   DELETE /api/destinations/:id
 * @access  Private (Hotel Manager)
 */
export const deleteDestination = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const destination = await Destination.findByIdAndDelete(req.params.id);
      if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
      return res.json({ success: true, message: 'Destination deleted' });
    }

    const idx = memoryStore.destinations.findIndex((d) => d._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Destination not found' });

    memoryStore.destinations.splice(idx, 1);
    res.json({ success: true, message: 'Destination deleted' });
  } catch (error) {
    next(error);
  }
};
