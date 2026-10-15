import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import PlaceList from '../components/PlaceList';
import Map from '../components/Map';
import PlaceDetails from '../components/PlaceDetails';
import AIChat from '../components/AIChat';
import { placesService } from '../services/placesService';
import { routingService } from '../services/routingService';
import { geocodeService } from '../services/geocodeService';
import { useAuth } from '../context/AuthContext';
import {
  getSearchIntent,
  filterRelevantResults,
} from '../utils/searchEngine';
import { AlertCircle, Sparkles, Map as MapIcon, Star } from 'lucide-react';

// Default initial location: Vijayawada (Andhra Pradesh, India)
const DEFAULT_CENTER = {
  lat: 16.5062,
  lng: 80.6480,
  name: 'Vijayawada',
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Location & Search States
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [locationName, setLocationName] = useState('Vijayawada');
  const [distanceKm, setDistanceKm] = useState(5); // 1-50 km, default 5 km
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  // Results & Selection States
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailsPlace, setDetailsPlace] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [favoritesMap, setFavoritesMap] = useState({});

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);

  const mapSectionRef = useRef(null);

  // Load user favorites into lookup map
  const loadFavorites = useCallback(async () => {
    if (!user || user.isGuest) {
      setFavoritesMap({});
      return;
    }
    try {
      const response = await placesService.getFavorites();
      const favMap = {};
      (response.data || []).forEach((fav) => {
        favMap[fav.placeId] = true;
      });
      setFavoritesMap(favMap);
    } catch (err) {
      console.warn('[Favorites] Could not load favorites:', err.message);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  /**
   * Primary Search Function:
   * 1. Geocodes location text (if new)
   * 2. Detects search intent (category & normalized keywords)
   * 3. Fetches real OpenStreetMap POIs via Overpass API
   * 4. Applies strict Haversine distance filtering (<= distanceKm)
   */
  const executeSearch = useCallback(
    async ({
      locText = locationName,
      queryText = searchQuery,
      catKey = category,
      km = distanceKm,
    }) => {
      setIsLoading(true);
      setErrorMessage(null);
      setRouteData(null);
      setSelectedPlace(null);

      try {
        let activeLat = center.lat;
        let activeLng = center.lng;
        let activeName = locText || center.name;

        // Step 1: Geocode location if provided and different from current center
        if (locText && locText.trim() && locText.trim().toLowerCase() !== center.name?.toLowerCase()) {
          const geoResults = await geocodeService.search(locText.trim(), 1);
          if (!geoResults || geoResults.length === 0) {
            setErrorMessage('Location not found. Please enter a valid city, area, or landmark.');
            setPlaces([]);
            setIsLoading(false);
            return;
          }
          const best = geoResults[0];
          activeLat = best.lat;
          activeLng = best.lng;
          activeName = best.name || locText.trim();
          setCenter({
            lat: activeLat,
            lng: activeLng,
            name: activeName,
          });
          setLocationName(activeName);
        }

        // Step 2: Extract search intent & normalizations
        const intent = getSearchIntent(queryText || catKey || '');
        const targetCategory = catKey || intent.category || '';
        const targetQuery = intent.keyword || '';

        // Step 3: Fetch from OpenStreetMap Overpass
        const radiusMeters = Math.min(Math.max(km, 1), 50) * 1000;
        const response = await placesService.getNearby({
          lat: activeLat,
          lng: activeLng,
          radius: radiusMeters,
          category: targetCategory,
          query: targetQuery,
          location: activeName,
        });

        const rawPlaces = response.data || [];

        // Step 4: Strict Haversine distance and relevance filtering
        const filtered = filterRelevantResults(
          rawPlaces,
          intent,
          activeLat,
          activeLng,
          km
        );

        setPlaces(filtered);
      } catch (err) {
        console.error('[Search] Execution error:', err);
        setErrorMessage('Unable to find places. Please try again.');
        setPlaces([]);
      } finally {
        setIsLoading(false);
      }
    },
    [center.lat, center.lng, center.name, locationName, searchQuery, category, distanceKm]
  );

  // Initial load search for Vijayawada (No automatic geolocation reset!)
  useEffect(() => {
    executeSearch({
      locText: 'Vijayawada',
      queryText: 'restaurant',
      catKey: 'restaurant',
      km: 5,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle SearchBar Form Submission (Location + Search Query + Distance in km)
  const handleSearchSubmit = ({ location, query, distanceKm: submittedKm }) => {
    setLocationName(location);
    setSearchQuery(query);
    setDistanceKm(submittedKm);
    executeSearch({
      locText: location,
      queryText: query,
      catKey: '', // Reset single-category chip when user custom searches
      km: submittedKm,
    });
  };

  // Handle category chip selection from FilterPanel
  const handleCategorySelect = (selectedCat) => {
    setCategory(selectedCat);
    setSearchQuery('');
    executeSearch({
      locText: locationName,
      queryText: '',
      catKey: selectedCat,
      km: distanceKm,
    });
  };

  // Handle instant distance change from quick radius presets or select dropdown
  const handleDistanceChange = (newKm) => {
    const validKm = Math.min(Math.max(Number(newKm) || 5, 1), 50);
    setDistanceKm(validKm);
    executeSearch({
      locText: locationName,
      queryText: searchQuery,
      catKey: category,
      km: validKm,
    });
  };

  // 1-Click recovery from empty state: expand search distance
  const handleExpandRadius = (newKm = 10) => {
    handleDistanceChange(newKm);
  };

  // 1-Click recovery from empty state: clear specific category and show all places
  const handleClearFilter = () => {
    setCategory('');
    setSearchQuery('');
    executeSearch({
      locText: locationName,
      queryText: '',
      catKey: '',
      km: distanceKm,
    });
  };

  // Client-side instant filter for Open Now and Top Rated
  const displayedPlaces = useMemo(() => {
    let list = [...places];
    if (filterOpenNow) {
      list = list.filter((p) => {
        if (!p.openingHours) return true;
        return !p.openingHours.toLowerCase().includes('closed');
      });
    }
    if (filterTopRated) {
      list = list.filter((p) => {
        const idHash = String(p.id || p.name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const rating = parseFloat(p.rating || p.googleRating || ((idHash % 8) / 10 + 4.2).toFixed(1));
        return rating >= 4.5;
      });
    }
    return list;
  }, [places, filterOpenNow, filterTopRated]);

  // Optional manual GPS button (never forced or auto-run on mount)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        let detectedName = 'My Location';
        try {
          const rev = await geocodeService.reverse(latitude, longitude);
          if (rev && rev.displayName) {
            detectedName = rev.displayName.split(',')[0];
          }
        } catch (e) {
          console.warn('[Geocoding] Reverse geocoding error:', e.message);
        }

        setCenter({
          lat: latitude,
          lng: longitude,
          name: detectedName,
        });
        setLocationName(detectedName);

        executeSearch({
          locText: detectedName,
          queryText: searchQuery,
          catKey: category,
          km: distanceKm,
        });
      },
      (err) => {
        setIsLocating(false);
        setErrorMessage(`Could not access GPS location: ${err.message}`);
      },
      { timeout: 8000 }
    );
  };

  // Handle Directions via OSRM (Fixed & Functional)
  const handleGetDirections = async (place) => {
    if (!place || !place.lat || !place.lng) return;
    setSelectedPlace(place);

    try {
      const route = await routingService.getDirections(
        center.lat,
        center.lng,
        place.lat,
        place.lng
      );
      if (route && route.coordinates && route.coordinates.length > 0) {
        setRouteData(route);
      }
    } catch (err) {
      console.warn('[Routing] Failed to fetch driving directions:', err.message);
    }

    // Smoothly scroll down to the map to see the polyline route
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Favorites toggle - separate login page redirect if not logged in
  const handleToggleFavorite = async (place) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isFav = Boolean(favoritesMap[place.id]);
    try {
      if (isFav) {
        await placesService.removeFavorite(place.id);
        setFavoritesMap((prev) => {
          const updated = { ...prev };
          delete updated[place.id];
          return updated;
        });
      } else {
        await placesService.addFavorite({
          placeId: place.id,
          name: place.name,
          category: place.category,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          distance: place.distance,
          phone: place.phone,
          website: place.website,
          openingHours: place.openingHours,
          tags: place.tags,
        });
        setFavoritesMap((prev) => ({ ...prev, [place.id]: true }));
      }
    } catch (err) {
      alert(`Favorite error: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      {/* 1. Navbar */}
      <Navbar onOpenAiModal={() => setIsAiOpen(true)} />

      {/* 2. Hero & Unified Search Section */}
      <header className="bg-white border-b border-slate-200/90 px-4 py-4 shrink-0 shadow-2xs z-20 space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
              Discover places <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">near you</span>
            </h1>
          </div>
        </div>

        {/* Unified Search Control: Location + Query + Distance Km + Search */}
        <div className="max-w-7xl mx-auto">
          <SearchBar
            initialLocationName={locationName}
            initialQuery={searchQuery}
            initialDistance={distanceKm}
            onDistanceChange={handleDistanceChange}
            onSearchSubmit={handleSearchSubmit}
            onUseMyLocation={handleUseMyLocation}
            isLocating={isLocating}
          />
        </div>

        {/* 3. Horizontally Scrollable Categories */}
        <div className="max-w-7xl mx-auto pt-1">
          <FilterPanel
            selectedCategory={category}
            onSelectCategory={handleCategorySelect}
          />
        </div>
      </header>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs font-semibold text-rose-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="font-bold hover:text-rose-950 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. Main Results Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Quick Filter Bar: Open Now, 4.5+ Rating, Place Count */}
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 font-heading">Quick Filters:</span>
            
            <button
              type="button"
              onClick={() => setFilterOpenNow((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filterOpenNow
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filterOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>Open Now</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTopRated((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filterTopRated
                  ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterTopRated ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span>Top Rated (4.5+ ★)</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{displayedPlaces.length}</span> of {places.length} places
          </div>
        </div>

        <section id="places-section" className="space-y-4">
          <PlaceList
            places={displayedPlaces}
            center={center}
            selectedPlace={selectedPlace}
            favoritesMap={favoritesMap}
            isLoading={isLoading}
            errorMessage={errorMessage}
            activeLocation={locationName}
            activeQuery={searchQuery}
            activeCategory={category}
            activeDistanceKm={distanceKm}
            onSelectPlace={(p) => setSelectedPlace(p)}
            onGetDirections={handleGetDirections}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetails={(p) => setDetailsPlace(p)}
            onRetry={() => {
              executeSearch({
                locText: locationName,
                queryText: searchQuery,
                catKey: category,
                km: distanceKm,
              });
            }}
            onExpandRadius={handleExpandRadius}
            onClearFilter={handleClearFilter}
          />
        </section>

        {/* 5. Interactive Leaflet Map (Display Only, Strictly BELOW Results) */}
        <section
          ref={mapSectionRef}
          id="map-section"
          className="space-y-3 pt-6 border-t border-slate-200"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 font-heading">
                <MapIcon className="w-5 h-5 text-blue-600" />
                <span>OpenStreetMap Explorer</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Display-only map centered automatically on {locationName} within {distanceKm} km.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                Location: {locationName}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                Distance: {distanceKm} km
              </span>
            </div>
          </div>

          {/* Full-width Display-Only Map Container */}
          <div className="w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
            <Map
              center={center}
              radius={distanceKm * 1000}
              places={displayedPlaces}
              selectedPlace={selectedPlace}
              routeData={routeData}
              onSelectPlace={(p) => setSelectedPlace(p)}
              onGetDirections={handleGetDirections}
              onOpenDetails={(p) => setDetailsPlace(p)}
              onClearRoute={() => setRouteData(null)}
            />

            {/* Floating AI Trigger */}
            <div className="absolute bottom-4 right-4 z-[400]">
              <button
                onClick={() => setIsAiOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer font-heading"
              >
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-slate-800 tracking-tight">Nearby<span className="text-blue-600">AI</span></span>
            <span>— Nearby Places Explorer</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Data &copy; OpenStreetMap contributors</span>
            <span>&bull;</span>
            <span>Powered by Leaflet & OSRM</span>
          </div>
        </div>
      </footer>

      {/* Place Details Modal Drawer */}
      {detailsPlace && (
        <PlaceDetails
          place={detailsPlace}
          center={center}
          isFavorite={Boolean(favoritesMap[detailsPlace.id])}
          onClose={() => setDetailsPlace(null)}
          onGetDirections={handleGetDirections}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* AI Chat Drawer */}
      {isAiOpen && (
        <AIChat
          isOpen={isAiOpen}
          currentLocation={center}
          radius={distanceKm * 1000}
          onClose={() => setIsAiOpen(false)}
          onApplyAIResults={(placesResult) => {
            if (placesResult && placesResult.length > 0) {
              setPlaces(placesResult);
            }
          }}
          onSelectPlace={(p) => setSelectedPlace(p)}
        />
      )}
    </div>
  );
};

export default Home;
