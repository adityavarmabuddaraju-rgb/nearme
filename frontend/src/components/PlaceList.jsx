import React, { useState, useMemo } from 'react';
import PlaceCard from './PlaceCard';
import { ArrowUpDown, Search, RotateCcw, AlertTriangle, Info } from 'lucide-react';

const PlaceList = ({
  places = [],
  center,
  selectedPlace,
  favoritesMap = {},
  isLoading = false,
  errorMessage = null,
  activeLocation = 'Vijayawada',
  activeQuery = '',
  activeCategory = '',
  activeDistanceKm = 5,
  onSelectPlace,
  onGetDirections,
  onToggleFavorite,
  onOpenDetails,
  onRetry,
  onExpandRadius,
  onClearFilter,
}) => {
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'rating', 'name'

  const sortedPlaces = useMemo(() => {
    if (!places) return [];
    return [...places].sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distance || 0) - (b.distance || 0);
      }
      if (sortBy === 'rating') {
        const rA = parseFloat(a.rating || a.googleRating || 4.2);
        const rB = parseFloat(b.rating || b.googleRating || 4.2);
        return rB - rA;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [places, sortBy]);

  // Format category/query title for summary
  const summaryTopic = activeQuery || activeCategory || 'places';

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Shimmer summary placeholder */}
        <div className="skeleton-shimmer h-6 rounded-lg w-64" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="skeleton-shimmer h-5 rounded-md w-24" />
                <div className="skeleton-shimmer h-5 rounded-md w-16" />
              </div>
              <div className="skeleton-shimmer h-6 rounded-md w-3/4" />
              <div className="skeleton-shimmer h-4 rounded-md w-5/6" />
              <div className="flex gap-2">
                <div className="skeleton-shimmer h-3.5 rounded-md w-1/3" />
                <div className="skeleton-shimmer h-3.5 rounded-md w-1/4" />
              </div>
              <div className="skeleton-shimmer h-9 rounded-xl w-full pt-1" />
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <div className="skeleton-shimmer h-9 rounded-xl flex-1" />
                <div className="skeleton-shimmer h-9 rounded-xl w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white rounded-3xl border border-rose-100 shadow-xs my-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
          Unable to find places. Please try again.
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
          Please check your connection, search term, or try a different location.
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 cursor-pointer font-heading"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Empty Results State with Smart 1-Click Recovery Actions
  if (!places || places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs my-3">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 shadow-2xs">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight font-heading">
          No places found within {activeDistanceKm} km of {activeLocation}.
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
          Try expanding the search radius or exploring popular categories nearby.
        </p>

        {/* 1-Click Smart Recovery Actions */}
        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
          {activeDistanceKm < 50 && onExpandRadius && (
            <button
              type="button"
              onClick={() => onExpandRadius(Math.min(activeDistanceKm + 10, 50))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all cursor-pointer font-heading"
            >
              <span>Expand to {Math.min(activeDistanceKm + 10, 50)} km</span>
            </button>
          )}

          {onClearFilter && (
            <button
              type="button"
              onClick={onClearFilter}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer font-heading"
            >
              <span>Show All Nearby Places</span>
            </button>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. Success Grid with Professional Summary
  return (
    <div className="flex flex-col space-y-4">
      {/* Search Summary Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-600">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-slate-900 text-sm font-heading">
            Showing {summaryTopic} near <span className="text-blue-600 font-black">{activeLocation}</span>
          </span>
          <span className="text-slate-400">•</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[11px]">
            Within {activeDistanceKm} km
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-bold text-slate-700 text-xs">
            {places.length} places found
          </span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 hover:text-blue-600 cursor-pointer focus:outline-none"
            aria-label="Sort places"
          >
            <option value="distance">Nearest First</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Informative fallback notice banner */}
      {places.some((p) => p.isFallback) && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900 animate-in fade-in duration-200">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Notice: </span>
            <span>
              Limited results for <strong>{summaryTopic}</strong> in OpenStreetMap for {activeLocation}. Showing popular places and prominent spots nearby instead:
            </span>
          </div>
        </div>
      )}

      {/* Grid of Places */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedPlaces.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            center={center}
            isSelected={selectedPlace && selectedPlace.id === place.id}
            isFavorite={Boolean(favoritesMap[place.id])}
            onSelect={onSelectPlace}
            onGetDirections={onGetDirections}
            onToggleFavorite={onToggleFavorite}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default PlaceList;
