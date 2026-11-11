
import { Router } from 'express';

import {
  registerUser,
  loginUser
} from '../controllers/user.controller.js';

import { verifyJWT } from '../middlewares/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get(
  '/me',
  verifyJWT,
  asyncHandler(async (req, res) => {
    return res.status(200).json(
      new ApiResponse(
        200,
        { user: req.user },
        'Current user fetched successfully'
      )
    );
  })
);

export default router;
