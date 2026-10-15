import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Navigation, AlertCircle, Plus } from 'lucide-react';
import { geocodeService } from '../services/geocodeService';

const SearchBar = ({
  initialLocationName = 'Vijayawada',
  initialQuery = '',
  initialDistance = 5,
  onDistanceChange,
  onSearchSubmit,
  onUseMyLocation,
  isLocating = false,
}) => {
  const [locationInput, setLocationInput] = useState(initialLocationName);
  const [placeInput, setPlaceInput] = useState(initialQuery);
  const [distanceKm, setDistanceKm] = useState(initialDistance);
  const [validationError, setValidationError] = useState('');

  // Geocoding suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Synchronize when parent updates location
  useEffect(() => {
    if (initialLocationName && initialLocationName !== 'My Current Location') {
      setLocationInput(initialLocationName);
    }
  }, [initialLocationName]);

  useEffect(() => {
    if (initialQuery) {
      setPlaceInput(initialQuery);
    }
  }, [initialQuery]);

  // Synchronize when parent updates distance
  useEffect(() => {
    if (initialDistance) {
      setDistanceKm(initialDistance);
    }
  }, [initialDistance]);

  // Debounced Nominatim autocomplete for location input
  useEffect(() => {
    if (!locationInput || locationInput.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingGeo(true);
      try {
        const results = await geocodeService.search(locationInput.trim(), 5);
        setSuggestions(results);
        setIsDropdownOpen(true);
      } catch (err) {
        console.warn('[Geocoding] Autocomplete warning:', err.message);
      } finally {
        setIsLoadingGeo(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [locationInput]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocationItem = (item) => {
    const name = item.name || item.displayName.split(',')[0];
    setLocationInput(name);
    setIsDropdownOpen(false);
    setValidationError('');
  };

  const handleDistanceChange = (val) => {
    const num = parseInt(val, 10);
    setDistanceKm(val);
    if (isNaN(num) || num < 1 || num > 50) {
      setValidationError('Please enter a distance between 1 and 50 km.');
    } else {
      setValidationError('');
      if (onDistanceChange) {
        onDistanceChange(num);
      }
    }
  };

  const handleAdd10Km = () => {
    const current = parseInt(distanceKm, 10) || 5;
    const nextKm = Math.min(current + 10, 50);
    handleDistanceChange(nextKm);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setIsDropdownOpen(false);

    // Validate location
    const trimmedLoc = locationInput.trim();
    if (!trimmedLoc) {
      setValidationError('Location not found. Please enter a valid city, area, or landmark.');
      return;
    }

    // Validate distance
    const parsedKm = parseInt(distanceKm, 10);
    if (isNaN(parsedKm) || parsedKm < 1 || parsedKm > 50) {
      setValidationError('Please enter a distance between 1 and 50 km.');
      return;
    }

    setValidationError('');

    if (onSearchSubmit) {
      onSearchSubmit({
        location: trimmedLoc,
        query: placeInput.trim(),
        distanceKm: parsedKm,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div ref={dropdownRef} className="w-full space-y-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5"
      >
        {/* 1. Location Input Field */}
        <div className="relative flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 pl-1 mb-1">
            Location
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setValidationError('');
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
              placeholder="Enter location (e.g. Vijayawada, Hyderabad)..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
              {isLoadingGeo && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
              {locationInput && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationInput('');
                    setSuggestions([]);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear location"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete Suggestions */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={`${item.placeId}-${idx}`}
                  type="button"
                  onClick={() => handleSelectLocationItem(item)}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50/80 flex items-start gap-2.5 transition-colors group cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.name || item.displayName.split(',')[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.displayName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Search Query Field */}
        <div className="relative flex-1 min-w-[220px]">
          <label className="block text-[11px] font-semibold text-slate-500 pl-1 mb-1">
            Search Places
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={placeInput}
              onChange={(e) => setPlaceInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search restaurants, cafes, malls, hospitals..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {placeInput && (
              <button
                type="button"
                onClick={() => setPlaceInput('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Distance Input (1 km - 50 km) */}
        <div className="shrink-0 w-full sm:w-40">
          <label className="block text-[11px] font-semibold text-slate-500 pl-1 mb-1">
            Distance
          </label>
          <div className="relative flex items-center">
            <select
              value={distanceKm}
              onChange={(e) => handleDistanceChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
              aria-label="Select search distance in kilometers"
            >
              {[1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50].map((km) => (
                <option key={km} value={km}>
                  {km} km {km === 20 ? '(+10 km)' : km === 30 ? '(+20 km)' : ''}
                </option>
              ))}
            </select>
            <span className="absolute right-3 pointer-events-none text-xs font-extrabold text-slate-400">
              ▼
            </span>
          </div>
        </div>

        {/* 4. Action Buttons: Search + Optional GPS */}
        <div className="flex items-center gap-2 pt-1 md:pt-5 shrink-0">
          <button
            type="submit"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer font-heading"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          {onUseMyLocation && (
            <button
              type="button"
              onClick={onUseMyLocation}
              disabled={isLocating}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 active:scale-95 rounded-xl border border-slate-200 transition-all cursor-pointer"
              title="Use current GPS location (optional)"
              aria-label="Use current GPS location"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </form>

      {/* Quick Radius Presets Pill Bar with +10 km More Option */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Distance:</span>
          {[2, 5, 8, 10, 15, 20, 25, 30].map((presetKm) => (
            <button
              key={presetKm}
              type="button"
              onClick={() => handleDistanceChange(presetKm)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                Number(distanceKm) === presetKm
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25 ring-2 ring-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
              }`}
            >
              {presetKm} km
            </button>
          ))}

          {/* Dedicated "+10 km More" One-Click Option */}
          <button
            type="button"
            onClick={handleAdd10Km}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs group"
            title={`Expand search radius by 10 km (to ${Math.min((parseInt(distanceKm, 10) || 5) + 10, 50)} km)`}
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-90 transition-transform" />
            <span>+10 km More</span>
          </button>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 hidden sm:block">
          Radius: <span className="font-bold text-blue-600">{distanceKm} km</span>
        </div>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 animate-in fade-in duration-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
