import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    userVisible: true
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true,
    userVisible: true
  },
  price: {
    type: String,
    required: [true, 'Please provide a price'],
    trim: true,
    userVisible: true
  },
  type: {
    type: String,
    required: [true, 'Please provide property type'],
    enum: ['flat', 'house', 'land', 'office'],
    userVisible: true
  },
  bhk: {
    type: String,
    required: function() {
      return this.type === 'flat' || this.type === 'house';
    },
    enum: ['1bhk', '2bhk', '3bhk', '4bhk', '5bhk', 'na'],
    userVisible: true
  },
  mode: {
    type: String,
    required: [true, 'Please specify if property is for buy or rent'],
    enum: ['buy', 'rent', 'sell'],
    userVisible: true
  },
  gallery: {
    type: [String],
    required: [true, 'Please provide at least one image'],
    userVisible: true
  },
  videos: {
    type: [String],
    default: [],
    userVisible: true,
    validate: {
      validator: function(videos) {
        if (!videos || videos.length === 0) return true;
        
        // Inline video validation function
        const isValidVideoUrl = (url) => {
          if (!url || typeof url !== 'string') return false;
          
          // YouTube patterns
          const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
          if (youtubeRegex.test(url)) return true;
          
          // Vimeo patterns
          const vimeoRegex = /(?:vimeo\.com\/)(?:.*#|.*\/)*([0-9]+)/;
          if (vimeoRegex.test(url)) return true;
          
          // Daily Motion patterns
          const dailyMotionRegex = /(?:dailymotion\.com\/video\/)([^_\?]+)/;
          if (dailyMotionRegex.test(url)) return true;
          
          // Direct video URL patterns (mp4, webm, etc.)
          const directVideoRegex = /\.(mp4|webm|avi|mov|wmv|flv|m4v)(\?.*)?$/i;
          if (directVideoRegex.test(url)) return true;
          
          return false;
        };
        
        return videos.every(url => isValidVideoUrl(url));
      },
      message: 'Please provide valid video URLs'
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    userVisible: true
  },
  // Additional real estate fields
  yearBuilt: {
    type: Number,
    userVisible: false
  },
  squareFootage: {
    type: Number,
    userVisible: true
  },
  lotSize: {
    type: String,
    userVisible: false
  },
  amenities: {
    type: [String],
    default: [],
    userVisible: true
  },
  propertyCondition: {
    type: String,
    enum: {
      values: ['new', 'excellent', 'good', 'fair', 'needs-renovation'],
      message: '{VALUE} is not a valid property condition'
    },
    userVisible: false,
    validate: {
      validator: function(v) {
        return !v || ['new', 'excellent', 'good', 'fair', 'needs-renovation'].includes(v);
      },
      message: 'Please select a valid property condition'
    }
  },
  nearbyAmenities: {
    type: [String],
    default: [],
    userVisible: true
  },
  nearbyLocations: {
    type: [String],
    default: [],
    userVisible: true
  },
  schoolDistrict: {
    type: String,
    userVisible: false
  },
  hoa: {
    type: String,
    userVisible: false
  },
  propertyTax: {
    type: String,
    userVisible: false
  },
  parkingSpaces: {
    type: Number,
    userVisible: true
  },
  floorNumber: {
    type: Number,
    userVisible: true
  },
  totalFloors: {
    type: Number,
    userVisible: true
  },
  furnishingStatus: {
    type: String,
    enum: {
      values: ['furnished', 'semi-furnished', 'unfurnished'],
      message: '{VALUE} is not a valid furnishing status'
    },
    userVisible: true,
    validate: {
      validator: function(v) {
        return !v || ['furnished', 'semi-furnished', 'unfurnished'].includes(v);
      },
      message: 'Please select a valid furnishing status'
    }
  },
  availabilityDate: {
    type: Date,
    userVisible: true
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
    },
    userVisible: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    userVisible: false
  },
  // PropertyDetails specific fields
  developer: {
    type: String,
    trim: true,
    userVisible: true
  },
  possessionDate: {
    type: String,
    trim: true,
    userVisible: true
  },
  projectArea: {
    type: String,
    trim: true,
    userVisible: true
  },
  launchDate: {
    type: String,
    trim: true,
    userVisible: true
  },
  totalUnits: {
    type: Number,
    userVisible: true
  },
  totalTowers: {
    type: Number,
    userVisible: true
  },
  highlights: {
    type: [String],
    default: [],
    userVisible: true
  },
  locationAdvantages: {
    type: [String],
    default: [],
    userVisible: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    userVisible: false
  }
});

export default mongoose.models.Property || mongoose.model('Property', PropertySchema);