
import { Router } from 'express';

import {
  createItem,
  getAllItems,
  getMyReports,
  getFoundItemContact,
  markFoundItemReturned
} from '../controllers/item.controller.js';

import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Get all active items (public route)
router.get('/', getAllItems);

// Get logged-in user's reports
router.get('/my-reports', verifyJWT, getMyReports);

// Get found item contact details (login required)
router.get('/:itemId/contact', verifyJWT, getFoundItemContact);

// Mark found item as returned (login required)
router.patch('/:itemId/returned', verifyJWT, markFoundItemReturned);

// Report a new item (login required)
router.post('/', verifyJWT, createItem);

export default router;
