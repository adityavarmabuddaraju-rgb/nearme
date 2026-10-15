import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { placesService } from '../services/placesService';
import { useAuth } from '../context/AuthContext';
import { Bookmark, MapPin, Trash2, Navigation, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    if (!user || user.isGuest) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await placesService.getFavorites();
      setFavorites(res.data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (placeId) => {
    try {
      await placesService.removeFavorite(placeId);
      setFavorites((prev) => prev.filter((f) => f.placeId !== placeId));
    } catch (err) {
      alert(`Could not remove favorite: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Map</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Saved Favorite Places
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your bookmarked OpenStreetMap places saved to your account
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {favorites.length} Saved
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Bookmark className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Favorites Saved Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              When exploring places on the map, click the bookmark icon on any place card to save it here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Explore Places</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => (
              <div
                key={fav._id || fav.placeId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {fav.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(fav.placeId)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove Favorite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {fav.name}
                  </h3>
                  {fav.address && (
                    <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{fav.address}</span>
                    </p>
                  )}
                  {fav.openingHours && (
                    <p className="text-xs text-slate-500 mt-1">
                      🕒 {fav.openingHours}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Lat: {fav.lat.toFixed(4)}, Lng: {fav.lng.toFixed(4)}
                  </span>
                  {fav.website && (
                    <a
                      href={fav.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
