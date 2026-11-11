
import { Router } from 'express';

import {
  createFoundRequest,
  getItemFoundRequests,
  getMyFoundRequests,
  updateFoundRequestStatus,
  getFoundRequestContacts,
  confirmFoundRequestReceived
} from '../controllers/foundRequest.controller.js';

import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All found request routes require authentication
router.use(verifyJWT);

// Finder submits a found request
router.post('/', createFoundRequest);

// Finder views their own submitted requests
router.get('/my-requests', getMyFoundRequests);

// Original reporter views requests for an item
router.get('/item/:itemId', getItemFoundRequests);

// Original reporter accepts or rejects a request
router.patch('/:requestId/status', updateFoundRequestStatus);

// Owner and finder access contacts after acceptance
router.get('/:requestId/contacts', getFoundRequestContacts);

// Owner confirms physical receipt of the item
router.patch('/:requestId/confirm-received', confirmFoundRequestReceived);

export default router;
