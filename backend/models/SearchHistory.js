import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    query: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'all',
    },
    radius: {
      type: Number,
      default: 5000,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30, // Auto expire searches older than 30 days
    },
  }
);

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
export default SearchHistory;
