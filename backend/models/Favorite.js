import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    placeId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'place',
    },
    address: {
      type: String,
      default: '',
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    openingHours: {
      type: String,
      default: '',
    },
    tags: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites per user
favoriteSchema.index({ user: 1, placeId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
