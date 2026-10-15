import React from 'react';
import { Polyline } from 'react-leaflet';
import { Clock, MapPin, X, MessageSquare, ExternalLink } from 'lucide-react';

const RouteLayer = ({
  routeData,
  destinationName,
  destinationPlace,
  startCenter,
  onClearRoute,
}) => {
  if (!routeData || !routeData.coordinates || routeData.coordinates.length === 0) {
    return null;
  }

  const googleNavUrl =
    destinationPlace?.lat && destinationPlace?.lng && startCenter?.lat && startCenter?.lng
      ? `https://www.google.com/maps/dir/?api=1&origin=${startCenter.lat},${startCenter.lng}&destination=${destinationPlace.lat},${destinationPlace.lng}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          destinationName || 'Destination'
        )}&travelmode=driving`;

  const googleSearchUrl =
    destinationPlace?.googleReviewsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      destinationName || 'Destination'
    )}`;

  return (
    <>
      {/* 1. Interactive Route Polyline */}
      <Polyline
        positions={routeData.coordinates}
        pathOptions={{
          color: '#2563eb', // Royal Blue
          weight: 6,
          opacity: 0.9,
          lineJoin: 'round',
          lineCap: 'round',
        }}
      />

      {/* Halo for high contrast readability */}
      <Polyline
        positions={routeData.coordinates}
        pathOptions={{
          color: '#ffffff',
          weight: 10,
          opacity: 0.6,
          lineJoin: 'round',
          lineCap: 'round',
        }}
      />

      {/* Floating Navigation Card */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] max-w-lg w-[94%] sm:w-[90%] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200 p-3.5 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Route to
              </p>
              <h4 className="text-sm font-extrabold text-slate-900 font-heading truncate max-w-[200px] sm:max-w-[280px]">
                {destinationName || 'Destination'}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {routeData.distanceText}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {routeData.durationText}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearRoute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Clear Route"
            aria-label="Clear Route"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar: Open in Maps + Reviews in Google */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {googleNavUrl && (
            <a
              href={googleNavUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer font-heading"
              title="Open location directly in Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 fill-current" />
              <span>Open in Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors cursor-pointer shrink-0"
            title="Open place details and verified reviews on Google Maps"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Google Reviews</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </>
  );
};

export default RouteLayer;
