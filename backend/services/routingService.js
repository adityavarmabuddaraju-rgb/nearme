import axios from 'axios';
import https from 'https';
import NodeCache from 'node-cache';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Format duration in seconds to human readable string
const formatDuration = (seconds) => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min${mins === 1 ? '' : 's'}`;
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs} hr${hrs === 1 ? '' : 's'} ${remainingMins} min${remainingMins === 1 ? '' : 's'}`;
};

// Format distance in meters
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

export const getRouteDirections = async (startLat, startLng, endLat, endLng) => {
  const sLat = parseFloat(startLat);
  const sLng = parseFloat(startLng);
  const eLat = parseFloat(endLat);
  const eLng = parseFloat(endLng);

  if (isNaN(sLat) || isNaN(sLng) || isNaN(eLat) || isNaN(eLng)) {
    throw new Error('Valid start and end coordinates are required');
  }

  const cacheKey = `route_${sLat.toFixed(4)}_${sLng.toFixed(4)}_${eLat.toFixed(4)}_${eLng.toFixed(4)}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // OSRM expects coordinates in order: lon,lat;lon,lat
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await axios.get(osrmUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'NearbyAI-App/1.0',
      },
      httpsAgent,
    });

    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      throw new Error('No route found between specified points');
    }

    const route = response.data.routes[0];
    // GeoJSON coordinates are [lng, lat]. React-Leaflet Polyline expects [lat, lng].
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    const steps = [];
    if (route.legs && route.legs[0] && route.legs[0].steps) {
      for (const step of route.legs[0].steps) {
        if (step.maneuver && step.name) {
          steps.push({
            instruction: `${step.maneuver.type} ${step.maneuver.modifier || ''} on ${step.name}`.trim(),
            distance: formatDistance(step.distance),
            duration: formatDuration(step.duration),
          });
        }
      }
    }

    const result = {
      coordinates,
      distanceMeters: Math.round(route.distance),
      distanceText: formatDistance(route.distance),
      durationSeconds: Math.round(route.duration),
      durationText: formatDuration(route.duration),
      steps: steps.slice(0, 8), // Keep concise steps for UI
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('[OSRM Routing Error]:', error.message);
    // Fallback: provide straight line coordinates between start and end
    return {
      coordinates: [
        [sLat, sLng],
        [eLat, eLng],
      ],
      distanceMeters: null,
      distanceText: 'Direct line',
      durationSeconds: null,
      durationText: 'Unavailable',
      steps: [],
      warning: 'Live road routing temporarily unavailable; showing direct vector',
    };
  }
};
