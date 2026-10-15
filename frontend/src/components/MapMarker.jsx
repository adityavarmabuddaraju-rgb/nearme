import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Info, ExternalLink, MessageSquare } from 'lucide-react';

// Get category-specific marker color and symbol
const getMarkerStyle = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('hospital') || cat.includes('clinic') || cat.includes('pharmacy')) {
    return { bg: '#ef4444', icon: '✚' }; // Red
  }
  if (cat.includes('restaurant') || cat.includes('fast_food')) {
    return { bg: '#f97316', icon: '🍴' }; // Orange
  }
  if (cat.includes('cafe')) {
    return { bg: '#845324', icon: '☕' }; // Brown
  }
  if (cat.includes('fuel') || cat.includes('petrol')) {
    return { bg: '#059669', icon: '⛽' }; // Emerald
  }
  if (cat.includes('bank') || cat.includes('atm')) {
    return { bg: '#0284c7', icon: '$' }; // Sky
  }
  if (cat.includes('hotel')) {
    return { bg: '#7c3aed', icon: '🛏' }; // Purple
  }
  if (cat.includes('school') || cat.includes('college') || cat.includes('university')) {
    return { bg: '#4f46e5', icon: '🎓' }; // Indigo
  }
  if (cat.includes('police')) {
    return { bg: '#1e3a8a', icon: '🛡' }; // Navy
  }
  if (cat.includes('station') || cat.includes('bus')) {
    return { bg: '#0d9488', icon: '🚏' }; // Teal
  }
  return { bg: '#2563eb', icon: '📍' }; // Default Blue
};

// Create a custom SVG Leaflet DivIcon
const createCustomIcon = (place, isSelected) => {
  const { bg, icon } = getMarkerStyle(place.category);
  const size = isSelected ? 38 : 30;

  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      background-color: ${isSelected ? '#e11d48' : bg};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      ${isSelected ? 'transform: rotate(-45deg) scale(1.2); box-shadow: 0 0 15px #e11d48;' : ''}
    ">
      <span style="
        transform: rotate(45deg);
        font-size: ${isSelected ? '14px' : '11px'};
        color: white;
        font-weight: bold;
        line-height: 1;
      ">${icon}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const MapMarker = ({ place, startCenter, isSelected, onSelect, onGetDirections, onOpenDetails }) => {
  const customIcon = createCustomIcon(place, isSelected);

  const googleNavUrl =
    startCenter?.lat && startCenter?.lng && place.lat && place.lng
      ? `https://www.google.com/maps/dir/?api=1&origin=${startCenter.lat},${startCenter.lng}&destination=${place.lat},${place.lng}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          place.name + (place.address ? ' ' + place.address : '')
        )}&travelmode=driving`;

  const googleSearchUrl =
    place.googleReviewsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      place.name + (place.address ? ' ' + place.address : '')
    )}`;

  return (
    <Marker
      position={[place.lat, place.lng]}
      icon={customIcon}
      eventHandlers={{
        click: () => onSelect && onSelect(place),
      }}
    >
      <Popup className="custom-marker-popup">
        <div className="p-1 min-w-[210px]">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {place.category}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
              {place.distanceText}
            </span>
          </div>
          <h4
            onClick={() => onOpenDetails && onOpenDetails(place)}
            className="text-sm font-bold text-slate-900 leading-tight mb-1 cursor-pointer hover:text-blue-600 transition-colors font-heading"
            title="Click to view details & reviews"
          >
            {place.name}
          </h4>
          {place.address && (
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">
              {place.address}
            </p>
          )}

          {/* Quick link to Details & Reviews */}
          <div className="mb-2">
            <button
              type="button"
              onClick={() => onOpenDetails && onOpenDetails(place)}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-blue-600" />
              <span>Reviews & Details</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <a
              href={googleNavUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer font-heading"
              title="Open directly in Google Maps"
            >
              <MapPin className="w-3 h-3 fill-current" />
              <span>Map</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            {onOpenDetails && (
              <button
                type="button"
                onClick={() => onOpenDetails(place)}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
                title="View Details & Reviews"
              >
                <Info className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default MapMarker;
