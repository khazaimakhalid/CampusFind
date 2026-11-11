
import { FoundRequest } from '../models/foundRequest.model.js';
import { Item } from '../models/item.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Finder submits a request for a lost item
const createFoundRequest = asyncHandler(async (req, res) => {
  const { itemId, evidencePhotoUrl, note } = req.body;

  if (!itemId || !evidencePhotoUrl?.trim() || !note?.trim()) {
    throw new ApiError(400, 'Item ID, evidence photo and note are required');
  }

  const item = await Item.findById(itemId);

  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  if (item.type !== 'lost' || item.status !== 'active') {
    throw new ApiError(400, 'This item is not available for found requests');
  }

  if (item.reportedBy.toString() === req.user._id.toString()) {
    throw new ApiError(403, 'You cannot submit a request for your own item');
  }

  const existingRequest = await FoundRequest.findOne({
    item: itemId,
    requestedBy: req.user._id,
    status: 'pending'
  });

  if (existingRequest) {
    throw new ApiError(409, 'You already have a pending request for this item');
  }

  const foundRequest = await FoundRequest.create({
    item: itemId,
    requestedBy: req.user._id,
    evidencePhotoUrl: evidencePhotoUrl.trim(),
    note: note.trim()
  });

  return res.status(201).json(
    new ApiResponse(201, foundRequest, 'Found request submitted successfully')
  );
});

// Owner views requests for their reported item
const getItemFoundRequests = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await Item.findById(itemId);

  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  if (item.reportedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to view these requests');
  }

  const requests = await FoundRequest.find({ item: itemId })
    .populate('requestedBy', 'name email')
    .populate('item', 'title category location imageUrl')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, 'Found requests fetched successfully')
  );
});

// Finder views their own submitted requests
const getMyFoundRequests = asyncHandler(async (req, res) => {
  const requests = await FoundRequest.find({
    requestedBy: req.user._id
  })
    .populate(
      'item',
      'title description category location dateLostFound imageUrl type status reportedBy'
    )
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, 'Your found requests fetched successfully')
  );
});

// Owner accepts or rejects a found request
const updateFoundRequestStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Status must be accepted or rejected');
  }

  const foundRequest = await FoundRequest.findById(requestId);

  if (!foundRequest) {
    throw new ApiError(404, 'Found request not found');
  }

  const item = await Item.findById(foundRequest.item);

  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  if (item.reportedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the original item reporter can review this request');
  }

  if (foundRequest.status !== 'pending') {
    throw new ApiError(400, 'This request has already been reviewed');
  }

  if (item.status !== 'active') {
    throw new ApiError(400, 'This item is no longer available for review');
  }

  foundRequest.status = status;
  foundRequest.reviewedBy = req.user._id;
  foundRequest.reviewedAt = new Date();

  await foundRequest.save();

  if (status === 'accepted') {
    item.status = 'in_progress';
    await item.save();

    // Reject other pending requests for the same item
    await FoundRequest.updateMany(
      {
        item: item._id,
        _id: { $ne: foundRequest._id },
        status: 'pending'
      },
      {
        $set: {
          status: 'rejected',
          reviewedBy: req.user._id,
          reviewedAt: new Date()
        }
      }
    );
  }

  return res.status(200).json(
    new ApiResponse(200, foundRequest, `Found request ${status} successfully`)
  );
});

// Get contact details after a request is accepted
const getFoundRequestContacts = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const foundRequest = await FoundRequest.findById(requestId);

  if (!foundRequest) {
    throw new ApiError(404, 'Found request not found');
  }

  const item = await Item.findById(foundRequest.item);

  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  const isOwner =
    item.reportedBy.toString() === req.user._id.toString();

  const isFinder =
    foundRequest.requestedBy.toString() === req.user._id.toString();

  if (!isOwner && !isFinder) {
    throw new ApiError(403, 'You are not authorized to view these contacts');
  }

  if (
    foundRequest.status !== 'accepted' ||
    item.status !== 'in_progress'
  ) {
    throw new ApiError(403, 'Contacts are available only for accepted requests');
  }

  const [owner, finder] = await Promise.all([
    User.findById(item.reportedBy).select(
      'name contactNumber whatsappNumber'
    ),
    User.findById(foundRequest.requestedBy).select(
      'name contactNumber whatsappNumber'
    )
  ]);

  if (!owner || !finder) {
    throw new ApiError(404, 'User details not found');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        owner: {
          name: owner.name,
          contactNumber: owner.contactNumber,
          whatsappNumber: owner.whatsappNumber
        },
        finder: {
          name: finder.name,
          contactNumber: finder.contactNumber,
          whatsappNumber: finder.whatsappNumber
        }
      },
      'Contact details fetched successfully'
    )
  );
});

// Owner confirms physical receipt of the item
const confirmFoundRequestReceived = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const foundRequest = await FoundRequest.findById(requestId);

  if (!foundRequest) {
    throw new ApiError(404, 'Found request not found');
  }

  const item = await Item.findById(foundRequest.item);

  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  if (item.reportedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the original item reporter can confirm receipt');
  }

  if (foundRequest.status !== 'accepted' || item.status !== 'in_progress') {
    throw new ApiError(400, 'This request is not ready for confirmation');
  }

  item.status = 'resolved';
  await item.save();

  return res.status(200).json(
    new ApiResponse(200, item, 'Item successfully marked as resolved')
  );
});

export {
  createFoundRequest,
  getItemFoundRequests,
  getMyFoundRequests,
  updateFoundRequestStatus,
  getFoundRequestContacts,
  confirmFoundRequestReceived
};
