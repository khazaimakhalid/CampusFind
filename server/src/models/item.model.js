
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    category: {
      type: String,
      required: [true, 'Item category is required'],
      enum: [
        'Bags',
        'Keys',
        'Books',
        'Electronics',
        'Clothing',
        'Documents',
        'Accessories',
        'Other'
      ]
    },

    type: {
      type: String,
      required: [true, 'Item type is required'],
      enum: ['lost', 'found']
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },

    dateLostFound: {
      type: Date,
      required: [true, 'Lost/found date is required']
    },
contactNumber: {
  type: String,
  trim: true,
  required: function () {
    return this.type === 'found' && !this.whatsappNumber;
  }
},

whatsappNumber: {
  type: String,
  trim: true,
  required: function () {
    return this.type === 'found' && !this.contactNumber;
  }
},

    imageUrl: {
      type: String,
      default: ''
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

   status: {
  type: String,
  enum: ['active', 'in_progress', 'resolved', 'returned'],
  default: 'active'
}
  },
  {
    timestamps: true
  }
);

const Item = mongoose.model('Item', itemSchema);

export { Item };
