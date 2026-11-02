import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * @desc    Register a new user (Tourist or authorized Hotel Manager)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, managerSecretCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const lowerEmail = email.toLowerCase();
    const targetRole = role === 'manager' ? 'manager' : 'tourist';
    let isManagerApproved = false;

    // Role Escalation Protection: Hotel Manager accounts require valid authorization secret code
    if (targetRole === 'manager') {
      const validCode = process.env.MANAGER_SECRET_CODE || 'HOTEL_MANAGER_SECURE_2026';
      if (!managerSecretCode || managerSecretCode !== validCode) {
        return res.status(403).json({
          success: false,
          message:
            'Unauthorized: Valid Manager Secret Verification Code is required to register as Hotel Manager',
        });
      }
      isManagerApproved = true;
    }

    let user;

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: lowerEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      user = await User.create({
        name,
        email: lowerEmail,
        password,
        role: targetRole,
        phone: phone || '',
        isManagerApproved,
      });
    } else {
      // In-Memory Fallback
      const userExists = memoryStore.users.some((u) => u.email === lowerEmail);
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = {
        _id: `user_${Date.now()}`,
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: targetRole,
        phone: phone || '',
        rewardPoints: 0,
        isManagerApproved,
        favorites: [],
        createdAt: new Date(),
      };
      memoryStore.users.push(user);
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: `${user.role === 'manager' ? 'Hotel Manager' : 'Tourist'} registered successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        rewardPoints: user.rewardPoints || 0,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const lowerEmail = email.toLowerCase();
    let user;
    let isMatch = false;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: lowerEmail }).select('+password');
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    } else {
      user = memoryStore.users.find((u) => u.email === lowerEmail);
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        rewardPoints: user.rewardPoints || 0,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    let user;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id).populate('favorites');
    } else {
      const found = memoryStore.users.find((u) => u._id.toString() === req.user._id.toString());
      if (found) {
        const { password, ...safe } = found;
        const populatedFavs = memoryStore.destinations.filter((d) =>
          (found.favorites || []).includes(d._id)
        );
        user = { ...safe, favorites: populatedFavs };
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    let updatedUser;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      if (req.body.password) user.password = req.body.password;
      updatedUser = await user.save();
    } else {
      const user = memoryStore.users.find((u) => u._id.toString() === req.user._id.toString());
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      updatedUser = user;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        rewardPoints: updatedUser.rewardPoints || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle favorite destination for tourist
 * @route   POST /api/auth/favorites/:destinationId
 * @access  Private
 */
export const toggleFavoriteDestination = async (req, res, next) => {
  try {
    const { destinationId } = req.params;
    let isFav = false;
    let favorites = [];

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      isFav = user.favorites.some((fav) => fav.toString() === destinationId);
      if (isFav) {
        user.favorites = user.favorites.filter((fav) => fav.toString() !== destinationId);
      } else {
        user.favorites.push(destinationId);
      }
      await user.save();
      favorites = user.favorites;
    } else {
      const user = memoryStore.users.find((u) => u._id.toString() === req.user._id.toString());
      if (user) {
        user.favorites = user.favorites || [];
        isFav = user.favorites.includes(destinationId);
        if (isFav) {
          user.favorites = user.favorites.filter((id) => id !== destinationId);
        } else {
          user.favorites.push(destinationId);
        }
        favorites = user.favorites;
      }
    }

    res.json({
      success: true,
      isFavorite: !isFav,
      message: isFav ? 'Removed from favorites' : 'Added to favorites',
      favorites,
    });
  } catch (error) {
    next(error);
  }
};
