import React from 'react';
import {
  Utensils,
  Coffee,
  Pizza,
  Hotel,
  Hospital,
  Stethoscope,
  Pill,
  Shield,
  Flame,
  CreditCard,
  Building2,
  Fuel,
  Zap,
  ShoppingBag,
  Store,
  ShoppingCart,
  Shirt,
  Footprints,
  Tv,
  Smartphone,
  Armchair,
  BookOpen,
  Scissors,
  Sparkles,
  Dumbbell,
  GraduationCap,
  School,
  Landmark,
  Library,
  Film,
  Trees,
  Car,
  Bus,
  Train,
  Plane,
  Compass,
  Layers,
  Home,
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Places', icon: Layers },
  { id: 'restaurant', label: 'Restaurants', icon: Utensils },
  { id: 'cafe', label: 'Cafes', icon: Coffee },
  { id: 'fast_food', label: 'Fast Food', icon: Pizza },
  { id: 'hotel', label: 'Hotels', icon: Hotel },
  { id: 'hostel', label: 'PG & Hostels', icon: Home },
  { id: 'hospital', label: 'Hospitals', icon: Hospital },
  { id: 'clinic', label: 'Clinics', icon: Stethoscope },
  { id: 'pharmacy', label: 'Pharmacies', icon: Pill },
  { id: 'police', label: 'Police Stations', icon: Shield },
  { id: 'fire_station', label: 'Fire Stations', icon: Flame },
  { id: 'atm', label: 'ATMs', icon: CreditCard },
  { id: 'bank', label: 'Banks', icon: Building2 },
  { id: 'fuel', label: 'Petrol / Fuel', icon: Fuel },
  { id: 'ev_charging', label: 'EV Charging', icon: Zap },
  { id: 'mall', label: 'Shopping Malls', icon: ShoppingBag },
  { id: 'supermarket', label: 'Supermarkets', icon: Store },
  { id: 'grocery', label: 'Grocery Stores', icon: ShoppingCart },
  { id: 'clothing', label: 'Clothing Stores', icon: Shirt },
  { id: 'shoes', label: 'Shoe Stores', icon: Footprints },
  { id: 'electronics', label: 'Electronics Stores', icon: Tv },
  { id: 'mobile_phone', label: 'Mobile Shops', icon: Smartphone },
  { id: 'furniture', label: 'Furniture Stores', icon: Armchair },
  { id: 'book_store', label: 'Book Stores', icon: BookOpen },
  { id: 'salon', label: 'Beauty Salons', icon: Scissors },
  { id: 'barber', label: 'Barbers', icon: Scissors },
  { id: 'spa', label: 'Spas & Wellness', icon: Sparkles },
  { id: 'gym', label: 'Gyms & Fitness', icon: Dumbbell },
  { id: 'school', label: 'Schools', icon: School },
  { id: 'college', label: 'Colleges', icon: GraduationCap },
  { id: 'university', label: 'Universities', icon: Landmark },
  { id: 'library', label: 'Libraries', icon: Library },
  { id: 'cinema', label: 'Movie Theaters', icon: Film },
  { id: 'park', label: 'Parks & Gardens', icon: Trees },
  { id: 'temple', label: 'Temples', icon: Landmark },
  { id: 'church', label: 'Churches', icon: Landmark },
  { id: 'mosque', label: 'Mosques', icon: Landmark },
  { id: 'tourist_attraction', label: 'Tourist Attractions', icon: Compass },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'bus_station', label: 'Bus Stations', icon: Bus },
  { id: 'railway_station', label: 'Railway Stations', icon: Train },
  { id: 'airport', label: 'Airports', icon: Plane },
];

const FilterPanel = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id || 'all'}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterPanel;
