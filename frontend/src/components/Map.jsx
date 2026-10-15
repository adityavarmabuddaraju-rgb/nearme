import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import MapMarker from './MapMarker';
import RouteLayer from './RouteLayer';

// Calculate appropriate zoom level based on distance in kilometers
const getZoomForDistance = (radiusMeters) => {
  const km = radiusMeters / 1000;
  if (km <= 1.5) return 15;
  if (km <= 3.5) return 14;
  if (km <= 6.5) return 13;
  if (km <= 10) return 12;
  if (km <= 20) return 11;
  if (km <= 35) return 10;
  if (km <= 50) return 9;
  return 9;
};

// Controller to automatically center and zoom map when center, radius, selectedPlace, or routeData changes
const AutoViewController = ({ center, radius, selectedPlace, routeData }) => {
  const map = useMap();

  useEffect(() => {
    // If a route polyline exists, automatically fit the map bounds to the route!
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(routeData.coordinates);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
        return;
      } catch (err) {
        console.warn('Could not fit bounds to route:', err);
      }
    }

    if (!center || !center.lat || !center.lng) return;

    if (selectedPlace && selectedPlace.lat && selectedPlace.lng) {
      map.setView([selectedPlace.lat, selectedPlace.lng], 15, { animate: true });
    } else {
      const targetZoom = getZoomForDistance(radius || 5000);
      map.setView([center.lat, center.lng], targetZoom, { animate: true });
    }
  }, [center?.lat, center?.lng, radius, selectedPlace, routeData, map]);

  return null;
};

// Pulsing user / epicenter icon
const createUserPulseIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: #4f46e5;
          opacity: 0.75;
          animation: userPulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background-color: #4f46e5;
          border: 2.5px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        "></div>
      </div>
    `,
    className: 'user-pin-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const Map = ({
  center,
  radius = 5000,
  places = [],
  selectedPlace,
  routeData,
  onSelectPlace,
  onGetDirections,
  onOpenDetails,
  onClearRoute,
}) => {
  const userIcon = createUserPulseIcon();
  const initialZoom = getZoomForDistance(radius);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/90 shadow-md">
      {/* Display-Only Badge */}
      <div className="absolute top-3 left-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs text-[11px] font-bold text-slate-700 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
        <span>Display-Only Map • Auto-centered</span>
      </div>

      <MapContainer
        key={`${center.lat.toFixed(4)}-${center.lng.toFixed(4)}-${radius}`}
        center={[center.lat, center.lng]}
        zoom={initialZoom}
        // Strict Display-Only options: No user drag, no user zoom, no zoom controls
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        className="w-full h-full cursor-default select-none"
      >
        {/* OpenStreetMap Standard Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Dynamic Center, Zoom & Route Auto-Controller */}
        <AutoViewController
          center={center}
          radius={radius}
          selectedPlace={selectedPlace}
          routeData={routeData}
        />

        {/* Visual Search Area Circle (non-draggable) */}
        {radius && (
          <Circle
            center={[center.lat, center.lng]}
            radius={radius}
            pathOptions={{
              color: '#4f46e5',
              fillColor: '#6366f1',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '5, 5',
            }}
          />
        )}

        {/* Epicenter Marker */}
        <Marker position={[center.lat, center.lng]} icon={userIcon} />

        {/* Place Markers */}
        {(places || []).map((place) => (
          <MapMarker
            key={place.id}
            place={place}
            startCenter={center}
            isSelected={selectedPlace && selectedPlace.id === place.id}
            onSelect={onSelectPlace}
            onGetDirections={onGetDirections}
            onOpenDetails={onOpenDetails}
          />
        ))}

        {/* Route Polyline Layer */}
        {routeData && (
          <RouteLayer
            routeData={routeData}
            destinationName={selectedPlace?.name}
            destinationPlace={selectedPlace}
            startCenter={center}
            onClearRoute={onClearRoute}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
