import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import memoryStore from '../utils/memoryStore.js';

/**
 * Protect routes: Requires valid JWT in Authorization header (Bearer <token>)
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'tourist_guide_super_secret_jwt_key_2026'
      );

      // Check MongoDB connection state
      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const foundUser = memoryStore.users.find(
          (u) => u._id.toString() === decoded.id.toString()
        );
        if (foundUser) {
          const { password, ...safeUser } = foundUser;
          req.user = safeUser;
        }
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }

      next();
    } catch (error) {
      console.error('Authentication Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired authentication token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided',
    });
  }
};
