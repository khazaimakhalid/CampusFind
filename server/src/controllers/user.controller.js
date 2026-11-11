
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    contactNumber,
    whatsappNumber
  } = req.body;

  if (
    !name?.trim() ||
    !email?.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  if (
    !contactNumber?.trim() &&
    !whatsappNumber?.trim()
  ) {
    throw new ApiError(
      400,
      'Please provide at least one contact number'
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail
  });

  if (existingUser) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    contactNumber: contactNumber?.trim() || '',
    whatsappNumber: whatsappNumber?.trim() || ''
  });

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };

  return res.status(201).json(
    new ApiResponse(201, safeUser, 'User registered successfully')
  );
});

// Login an existing user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase()
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id);

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: safeUser, accessToken },
      'Login successful'
    )
  );
});

export { registerUser, loginUser };
