import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  price: {
    type: String,
    required: [true, 'Please provide a price'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide property type'],
    enum: ['flat', 'house', 'land', 'office']
  },
  bhk: {
    type: String,
    required: function() {
      return this.type === 'flat' || this.type === 'house';
    },
    enum: ['1bhk', '2bhk', '3bhk', '4bhk', '5bhk', 'na']
  },
  mode: {
    type: String,
    required: [true, 'Please specify if property is for buy or rent'],
    enum: ['buy', 'rent', 'sell']
  },
  gallery: {
    type: [String],
    required: [true, 'Please provide at least one image']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide a contact number'],
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.length === 10 && /^\d+$/.test(v);
      },
      message: 'Please provide a 10-digit phone number'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Property || mongoose.model('Property', PropertySchema);