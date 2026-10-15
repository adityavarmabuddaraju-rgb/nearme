import React, { useState } from 'react';
import { Crosshair, Loader2 } from 'lucide-react';

const LocationButton = ({ onLocationFound, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      if (onError) {
        onError('Geolocation is not supported by your browser. Please search for your city or area manually.');
      }
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const { latitude, longitude } = position.coords;
        if (onLocationFound) {
          onLocationFound({
            lat: latitude,
            lng: longitude,
            name: 'My Current Location',
          });
        }
      },
      (error) => {
        setIsLoading(false);
        let message = 'Could not access your location. Please type your location in the search bar above.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location access was denied. Please allow location permissions in your browser or search manually for your area.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is currently unavailable. Please search for your location manually.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Please try again or search manually.';
        }
        if (onError) {
          onError(message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <button
      type="button"
      onClick={handleGetLocation}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm shadow-blue-500/20 transition-all disabled:opacity-75"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Crosshair className="w-4 h-4" />
      )}
      <span>Use My Location</span>
    </button>
  );
};

export default LocationButton;
