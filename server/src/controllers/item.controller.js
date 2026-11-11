
import { Item } from '../models/item.model.js';
import { ApiError } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new lost/found item
const createItem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    type,
    location,
    dateLostFound,
    imageUrl,
    contactNumber,
    whatsappNumber
  } = req.body;

  if (
    !title?.trim() ||
    !description?.trim() ||
    !category ||
    !type ||
    !location?.trim() ||
    !dateLostFound
  ) {
    throw new ApiError(400, 'Please provide all required item details');
  }

  if (!['lost', 'found'].includes(type)) {
    throw new ApiError(400, 'Item type must be lost or found');
  }

  if (
    type === 'found' &&
    !contactNumber?.trim() &&
    !whatsappNumber?.trim()
  ) {
    throw new ApiError(400, 'Please provide at least one contact number');
  }

  const item = await Item.create({
    title: title.trim(),
    description: description.trim(),
    category,
    type,
    location: location.trim(),
    dateLostFound,
    imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
    contactNumber: type === 'found' ? contactNumber?.trim() || '' : '',
    whatsappNumber: type === 'found' ? whatsappNumber?.trim() || '' : '',
    reportedBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, item, 'Item reported successfully')
  );
});

// Get all active items (hide contact details)
const getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ status: 'active' })
    .select('-contactNumber -whatsappNumber')
    .populate('reportedBy', 'name')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, items, 'Items fetched successfully')
  );
});

// Get logged-in user's reports
const getMyReports = asyncHandler(async (req, res) => {
  const items = await Item.find({
    reportedBy: req.user._id
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, items, 'Your reports fetched successfully')
  );
});

// Get contact details of a found item
const getFoundItemContact = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await Item.findOne({
    _id: itemId,
    type: 'found',
    status: 'active'
  }).select('contactNumber whatsappNumber reportedBy');

  if (!item) {
    throw new ApiError(404, 'Found item not found');
  }

  // Finder cannot access their own contact details through this endpoint
  if (item.reportedBy.toString() === req.user._id.toString()) {
    throw new ApiError(403, 'You cannot view your own contact details here');
  }

  if (!item.contactNumber && !item.whatsappNumber) {
    throw new ApiError(404, 'Contact details not available');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        contactNumber: item.contactNumber,
        whatsappNumber: item.whatsappNumber
      },
      'Contact details fetched successfully'
    )
  );
});

// Mark a found item as returned
const markFoundItemReturned = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await Item.findOneAndUpdate(
    {
      _id: itemId,
      type: 'found',
      reportedBy: req.user._id,
      status: 'active'
    },
    {
      $set: { status: 'returned' }
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!item) {
    throw new ApiError(
      404,
      'Active found item not found or you are not authorized to update it'
    );
  }

  return res.status(200).json(
    new ApiResponse(200, item, 'Item marked as returned successfully')
  );
});

export {
  createItem,
  getAllItems,
  getMyReports,
  getFoundItemContact,
  markFoundItemReturned
};
