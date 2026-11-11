
import { ApiError } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error?.code === 11000) {
    error = new ApiError(409, 'Email is already registered');
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }

  if (error?.name === 'ValidationError') {
    return res.status(400).json(
      new ApiResponse(400, null, error.message)
    );
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

export { errorHandler };
