import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { placesService } from '../services/placesService';
import { useAuth } from '../context/AuthContext';
import { History as HistoryIcon, Trash2, Calendar, MapPin, Search, ArrowLeft, Loader2 } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user || user.isGuest) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await placesService.getHistory();
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load search history:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id) => {
    try {
      await placesService.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(`Could not remove search item: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire search history?')) return;
    try {
      await placesService.clearHistory();
      setHistory([]);
    } catch (err) {
      alert(`Could not clear history: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
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
              Search History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your recent OpenStreetMap queries, locations, and radii
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Search History Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Searches you run on the map or with the AI Assistant will appear here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Start Searching</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {history.map((item) => (
              <div
                key={item._id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {item.query || 'Nearby Places'}
                      </span>
                      {item.category && item.category !== 'all' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                        {item.radius / 1000} km
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.lat.toFixed(3)}, {item.lng.toFixed(3)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.createdAt).toLocaleDateString()} at{' '}
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-slate-400">
                        ({item.resultsCount} places found)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item._id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors opacity-80 group-hover:opacity-100"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
