import api from './api';

export const routingService = {
  // Fetch driving route, polyline coordinates and duration
  getDirections: async (startLat, startLng, endLat, endLng) => {
    const response = await api.get('/directions', {
      params: { startLat, startLng, endLat, endLng },
    });
    return response.data?.data;
  },

  // Alias for getDirections
  getRoute: async (startLat, startLng, endLat, endLng) => {
    const response = await api.get('/directions', {
      params: { startLat, startLng, endLat, endLng },
    });
    return response.data?.data;
  },
};

export default routingService;
