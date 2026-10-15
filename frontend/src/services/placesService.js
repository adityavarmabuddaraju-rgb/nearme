import api from './api';

export const placesService = {
  // Fetch nearby places from Overpass / OpenStreetMap API
  getNearby: async ({ lat, lng, radius = 5000, category = '', query = '', location = '', limit = 60 }) => {
    const response = await api.get('/places/nearby', {
      params: { lat, lng, radius, category, query, location, limit },
    });
    return response.data;
  },

  // Search places with custom keyword
  search: async ({ q, lat, lng, radius = 5000, location = '' }) => {
    const response = await api.get('/places/search', {
      params: { q, lat, lng, radius, location },
    });
    return response.data;
  },

  // Get place by ID
  getById: async (id) => {
    const response = await api.get(`/places/${encodeURIComponent(id)}`);
    return response.data;
  },

  // Favorites
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  addFavorite: async (placeData) => {
    const response = await api.post('/favorites', placeData);
    return response.data;
  },

  removeFavorite: async (placeId) => {
    const response = await api.delete(`/favorites/${encodeURIComponent(placeId)}`);
    return response.data;
  },

  // Search History
  getHistory: async () => {
    const response = await api.get('/history');
    return response.data;
  },

  deleteHistoryItem: async (id) => {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  },

  clearHistory: async () => {
    const response = await api.delete('/history');
    return response.data;
  },
};

export default placesService;
