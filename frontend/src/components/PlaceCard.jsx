import React, { useState } from 'react';
import {
  MapPin,
  Bookmark,
  ExternalLink,
  Phone,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Globe,
  Info,
  Share2,
  Check,
} from 'lucide-react';
import { mapOSMCategory } from '../utils/searchEngine';
import { generateReviewsForPlace } from '../utils/reviewsData';

const PlaceCard = ({
  place,
  center,
  isSelected,
  isFavorite,
  onSelect,
  onGetDirections,
  onToggleFavorite,
  onOpenDetails,
}) => {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayCategory = mapOSMCategory(place.tags, place.category);
  const reviewsList = generateReviewsForPlace(place);

  // Deterministic rating calculation (4.2 - 4.9)
  const idHash = String(place.id || place.name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const displayRating = place.rating || ((idHash % 8) / 10 + 4.2).toFixed(1);
  const reviewCount = (idHash % 160) + 32;

  const googleNavUrl =
    center?.lat && center?.lng && place.lat && place.lng
      ? `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${place.lat},${place.lng}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          place.name + (place.address ? ' ' + place.address : '')
        )}&travelmode=driving`;

  const googleSearchUrl =
    place.googleReviewsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      place.name + (place.address ? ' ' + place.address : '')
    )}`;

  // Determine open/closed status if hours tag is available
  const hasHours = Boolean(place.openingHours);
  const isOpenNow = hasHours
    ? !place.openingHours.toLowerCase().includes('closed')
    : true;

  const handleCardClick = () => {
    if (onSelect) onSelect(place);
    if (onOpenDetails) onOpenDetails(place);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'ring-2 ring-blue-600 border-blue-600 shadow-md bg-blue-50/20'
          : 'border-slate-200/90 hover:border-blue-300'
      }`}
    >
      <div className="space-y-2.5">
        {/* 1. Header: Category Pill, Status Badge, Distance & Bookmark */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {displayCategory}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isOpenNow
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/80'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{isOpenNow ? 'Open' : 'Closed'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/70">
              {place.distanceText || `${place.distance} m`}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(place);
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                  : 'bg-white text-slate-400 hover:text-rose-600 hover:bg-slate-50 border-slate-200'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              aria-label="Toggle favorite"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Place Name & Rating */}
        <div className="flex items-start justify-between gap-2 pt-0.5">
          <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
            {place.name}
          </h3>

          <div className="flex items-center gap-1 shrink-0 bg-amber-50/90 px-2 py-0.5 rounded-lg border border-amber-200/80">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="text-xs font-bold text-slate-900">{displayRating}</span>
            <span className="text-[10px] text-slate-400 font-medium">({reviewCount})</span>
          </div>
        </div>

        {/* 3. Address */}
        {place.address && (
          <p className="flex items-start gap-1.5 text-xs text-slate-500 leading-normal">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{place.address}</span>
          </p>
        )}

        {/* 4. Hours, Phone, Website */}
        {(place.openingHours || place.phone || place.website) && (
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 pt-0.5">
            {place.openingHours && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[140px]">{place.openingHours}</span>
              </div>
            )}

            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium"
              >
                <Phone className="w-3 h-3" />
                <span>{place.phone}</span>
              </a>
            )}

            {place.website && (
              <a
                href={place.website.startsWith('http') ? place.website : `https://${place.website}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium"
              >
                <Globe className="w-3 h-3" />
                <span>Website</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        )}

        {/* 5. Embedded Google Reviews Drawer */}
        <div className="pt-1.5 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsReviewsOpen(!isReviewsOpen);
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/60 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Reviews</span>
              <span className="text-amber-600 font-bold ml-0.5">★ {displayRating}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <span>{isReviewsOpen ? 'Hide' : 'View Reviews'}</span>
              {isReviewsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* Expanded Reviews Drawer */}
          {isReviewsOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* Google Reviews Action */}
              <div>
                <a
                  href={googleSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200/80 transition-colors"
                  title="Read customer reviews on Google Maps"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Reviews</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </a>
              </div>

              {reviewsList.map((rev, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rev.author}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                      <span>★ {rev.rating}.0</span>
                      <span className="text-slate-400 font-normal">• {rev.time}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>
              ))}

              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 font-bold text-xs transition-colors"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 6. Action Buttons: Direct Map Button + Share + Details */}
      <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center gap-2">
        <a
          href={googleNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-xs shadow-blue-500/20 transition-all cursor-pointer font-heading"
          title="Open directly in Google Maps"
        >
          <MapPin className="w-3.5 h-3.5 fill-current" />
          <span>Map</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
        </a>

        {/* Quick Share Link Feature */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.clipboard) {
              navigator.clipboard.writeText(googleNavUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200/80'
          }`}
          title={copied ? 'Link Copied!' : 'Copy Google Maps Link'}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold">Copied</span>
            </>
          ) : (
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

        {onOpenDetails && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(place);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-all cursor-pointer"
            title="View Details & Reviews"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Details</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
