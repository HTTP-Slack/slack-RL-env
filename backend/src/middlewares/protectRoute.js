import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  let token;

  if(req.cookies.token) {
    token = req.cookies.token;
  }

  // 1. Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Get the user from the token's ID and attach it to the request
    // We remove the password from the user object before attaching
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // 4. Proceed to the next middleware/controller
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' })
  }
}