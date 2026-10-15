import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, MapPin, X, Loader2, ArrowRight } from 'lucide-react';
import { aiService } from '../services/aiService';

const SAMPLE_PROMPTS = [
  'Find quiet cafes for studying within 3 km',
  'Find hospitals near me',
  'Find pharmacies open now',
  'Find petrol stations within 2 km',
  'Find top restaurants within 5 km',
  'Find ATMs and banks nearby',
];

const AIChat = ({
  isOpen,
  onClose,
  currentLocation,
  radius,
  onApplyAIResults,
  onSelectPlace,
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am NearbyAI Assistant. Ask me anything in natural language (e.g. 'Find quiet cafes for studying within 3 km' or 'Show hospitals near me'), and I'll extract search criteria, search OpenStreetMap, and rank the best verified places for you!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (userText) => {
    const textToSend = userText || prompt;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    if (!currentLocation) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: textToSend },
        {
          sender: 'ai',
          text: 'Please allow or set your location first so I can find places near you!',
        },
      ]);
      setPrompt('');
      return;
    }

    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setPrompt('');
    setIsLoading(true);

    try {
      const data = await aiService.searchWithAI({
        prompt: textToSend,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        defaultRadius: radius || 5000,
      });

      const { structuredQuery, places, aiAnalysis } = data;

      // Update main dashboard places and category if callback provided
      if (onApplyAIResults) {
        onApplyAIResults(places, structuredQuery);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiAnalysis.summary || `Found ${places.length} places on OpenStreetMap matching your query!`,
          structuredQuery,
          recommendations: aiAnalysis.recommendations || [],
          places,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Sorry, I encountered an issue: ${err.message}. Please try a slightly different query.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 via-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">NearbyAI Assistant</h3>
              <p className="text-[11px] text-blue-700 font-semibold">
                Natural-Language Geospatial Search
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-start gap-2 max-w-[90%]">
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Show AI Extracted Parameters */}
                  {msg.structuredQuery && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-xs">
                      <p className="font-bold text-slate-700 mb-1">
                        🎯 Extracted Search Parameters:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.structuredQuery.category && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md font-semibold">
                            Category: {msg.structuredQuery.category}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold">
                          Radius: {msg.structuredQuery.radius / 1000} km
                        </span>
                        {msg.structuredQuery.openNow && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-md font-semibold">
                            Open Now
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show Ranked Place Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="font-bold text-slate-800 text-xs">
                        ⭐ Top Ranked OpenStreetMap Picks:
                      </p>
                      {msg.recommendations.map((rec, rIdx) => (
                        <div
                          key={rIdx}
                          onClick={() => {
                            const found = (msg.places || []).find((p) => p.id === rec.placeId);
                            if (found && onSelectPlace) {
                              onSelectPlace(found);
                              onClose();
                            }
                          }}
                          className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 text-xs truncate">
                              {rec.name}
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              {rec.distanceText}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            {rec.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Analyzing query & searching OpenStreetMap...</span>
            </div>
          )}
        </div>

        {/* Quick Sample Queries */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
            Suggested Prompts:
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SAMPLE_PROMPTS.map((sample, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleSend(sample)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-700 shrink-0 transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="relative flex items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask NearbyAI (e.g. 'Find cafes within 3 km')..."
              className="w-full pl-3.5 pr-12 py-2.5 bg-slate-100 text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
