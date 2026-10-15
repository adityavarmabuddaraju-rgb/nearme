import api from './api';

export const geocodeService = {
  // Search location using Nominatim forward geocoding
  search: async (query, limit = 5) => {
    if (!query || !query.trim()) return [];
    const response = await api.get('/geocode/search', {
      params: { q: query.trim(), limit },
    });
    return response.data?.data || [];
  },

  // Reverse geocode coordinates to location address
  reverse: async (lat, lng) => {
    const response = await api.get('/geocode/reverse', {
      params: { lat, lng },
    });
    return response.data?.data;
  },
};
