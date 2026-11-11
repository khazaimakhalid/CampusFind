
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    contactNumber: {
  type: String,
  trim: true,
  default: ''
},

whatsappNumber: {
  type: String,
  trim: true,
  default: ''
},

    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export { User };
