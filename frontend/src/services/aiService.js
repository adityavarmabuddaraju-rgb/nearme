import api from './api';

export const aiService = {
  // Parse natural language and retrieve matching places
  searchWithAI: async ({ prompt, lat, lng, defaultRadius = 5000 }) => {
    const response = await api.post('/ai/search', {
      prompt,
      lat,
      lng,
      defaultRadius,
    });
    return response.data?.data;
  },

  // Ask AI to rank or recommend places based on user criteria
  recommendPlaces: async ({ prompt, places }) => {
    const response = await api.post('/ai/recommend', {
      prompt,
      places,
    });
    return response.data?.data;
  },
};
