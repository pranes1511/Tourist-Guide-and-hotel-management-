import jwt from 'jsonwebtoken';

/**
 * Generate JSON Web Token (JWT) with user ID and role
 * @param {string} userId - Mongoose User ObjectId
 * @param {string} role - User role ('tourist' | 'manager')
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'tourist_guide_super_secret_jwt_key_2026',
    {
      expiresIn: '30d',
    }
  );
};

export default generateToken;
