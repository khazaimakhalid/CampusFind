
import mongoose from 'mongoose';

const foundRequestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item ID is required']
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requesting user is required']
    },

    evidencePhotoUrl: {
      type: String,
      required: [true, 'Evidence photo is required'],
      trim: true
    },

    note: {
      type: String,
      required: [true, 'Please explain where or how you found the item'],
      trim: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const FoundRequest = mongoose.model(
  'FoundRequest',
  foundRequestSchema
);

export { FoundRequest };
