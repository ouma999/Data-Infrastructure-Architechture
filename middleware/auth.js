// =============================================
// middleware/auth.js
// =============================================
// This is a security guard for your private routes.
// When someone tries to access admin-only endpoints,
// this middleware checks if they have a valid login token.
//
// HOW IT WORKS:
// 1. User logs in via POST /api/auth/login
// 2. Server gives them a TOKEN (like a wristband at an event)
// 3. Every time they call a private route, they send that token
// 4. This file checks if the token is valid before letting them in
// =============================================

const jwt = require('jsonwebtoken');

function protect(req, res, next) {

  // The token is sent in the request header like this:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  const authHeader = req.headers['authorization'];

  // If there is no token at all, block the request
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access denied. Please log in first.' 
    });
  }

  // Extract just the token part (remove the word "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Check if the token is valid and not expired
    // JWT_SECRET is the secret key from your .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user info to the request so routes can use it
    // e.g. req.user.id, req.user.name
    req.user = decoded;

    // Token is valid — move on to the actual route
    next();

  } catch (err) {
    return res.status(401).json({ 
      error: 'Invalid or expired token. Please log in again.' 
    });
  }
}

module.exports = { protect };