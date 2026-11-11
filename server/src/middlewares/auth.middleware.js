
import jwt from 'jsonwebtoken';

import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token is required');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Authentication token is required');
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired authentication token');
  }

  const user = await User.findById(decodedToken.userId).select(
    '-passwordHash'
  );

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  req.user = user;

  next();
});

export { verifyJWT };
