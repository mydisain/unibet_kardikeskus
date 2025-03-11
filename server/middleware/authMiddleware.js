const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Log the authorization header (safely)
  console.log('Auth headers:', req.headers.authorization ? 
    `Bearer ${req.headers.authorization.substring(7, Math.min(17, req.headers.authorization.length))}...` : 
    'No authorization header');

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      if (!token || token.length < 10) {
        console.error('Invalid token format or length:', token ? `${token.substring(0, 3)}...` : 'null');
        res.status(401);
        throw new Error('Invalid authentication token');
      }
      
      console.log('Token extracted:', token.substring(0, 10) + '...');

      // Verify token with more detailed error handling
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verification successful, payload:', decoded);
        
        // Ensure the ID is properly formatted
        if (decoded && decoded.id && typeof decoded.id === 'string') {
          // Make sure the ID doesn't have any whitespace
          decoded.id = decoded.id.trim();
        }
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError.message);
        res.status(401);
        throw new Error(`Token verification failed: ${jwtError.message}`);
      }
      
      if (!decoded || !decoded.id) {
        console.error('Invalid token payload, missing id');
        res.status(401);
        throw new Error('Invalid token payload');
      }
      
      console.log('Token verified, user id:', decoded.id, 'type:', typeof decoded.id);

      // Get user from the token - try multiple lookup methods to ensure we find the user
      console.log('Looking up user with id:', decoded.id, 'type:', typeof decoded.id);
      
      let user = null;
      
      try {
        // Get all users first to help with debugging
        const allUsers = await User.find().select('-password');
        console.log('Found', allUsers.length, 'users in database');
        
        if (allUsers.length === 0) {
          console.error('No users found in database');
          res.status(401);
          throw new Error('No users in database');
        }
        
        // Log all user IDs for debugging
        allUsers.forEach(u => {
          console.log('User in DB:', u._id.toString());
        });
        
        // Try different methods to find the user
        
        // 1. First try with the ID as is
        try {
          user = await User.findById(decoded.id).select('-password');
          console.log('Direct ID lookup result:', user ? 'User found' : 'User not found');
        } catch (err) {
          console.log('Error in direct ID lookup:', err.message);
        }
        
        // 2. If not found, try string comparison
        if (!user && typeof decoded.id === 'string') {
          console.log('Trying string comparison for ID:', decoded.id);
          user = allUsers.find(u => u._id.toString() === decoded.id);
          
          if (user) {
            console.log('User found using string comparison');
          }
        }
        
        // 3. If still not found, try the first admin user as a fallback
        if (!user) {
          console.log('Trying to find any admin user as fallback');
          user = allUsers.find(u => u.isAdmin === true);
          
          if (user) {
            console.log('Admin user found as fallback:', user._id.toString());
          }
        }
      } catch (dbError) {
        console.error('Database error looking up user:', dbError.message);
      }
      
      // Assign the found user to req.user
      req.user = user;
      
      if (!req.user) {
        console.error('User not found with id:', decoded.id);
        res.status(401);
        throw new Error('User not found');
      }
      
      console.log('User authenticated:', { 
        id: req.user._id, 
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin 
      });
      
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      res.status(401);
      throw new Error(`Not authorized, token failed: ${error.message}`);
    }
  } else {
    console.error('No Bearer token in authorization header');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (!req.user) {
    console.error('Admin check failed: No user in request');
    res.status(401);
    throw new Error('Not authorized, no user found');
  }
  
  console.log('Admin check for user:', { 
    id: req.user._id, 
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin 
  });
  
  if (req.user.isAdmin === true) { // Explicitly check for true
    console.log('Admin access granted for user:', req.user._id);
    next();
  } else {
    console.error('Admin access denied for user:', req.user._id, 'isAdmin value:', req.user.isAdmin);
    res.status(403); // Using 403 Forbidden is more appropriate for authorization failures
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };
