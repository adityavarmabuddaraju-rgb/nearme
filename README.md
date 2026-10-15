# NearbyAI – AI-Powered Nearby Places Finder

An open-source, full-stack **MERN** web application for discovering and navigating nearby places with **Zero Google Maps dependencies**.

Built with **React**, **Vite**, **Tailwind CSS**, **React-Leaflet**, **Leaflet**, and **OpenStreetMap**, coupled with a robust **Node.js/Express** backend, **MongoDB**, **Nominatim**, **Overpass API**, **OSRM Routing**, and **Gemini AI**.

---

## 🌟 Key Features

1. **Zero Google Maps APIs**:
   - **OpenStreetMap Tile Layer**: Interactive Leaflet maps with pan, zoom, custom SVG pins, popup details, and boundary circles.
   - **Nominatim Geocoding**: Forward and reverse location search with debouncing, respectful `User-Agent` headers, and caching.
   - **Overpass API Integration**: Real-time retrieval of POIs directly from OpenStreetMap data across 16+ categories (Restaurants, Cafes, Hospitals, Pharmacies, Police, ATMs, Banks, Hotels, Colleges, Schools, Fuel/Petrol, Shopping Malls, Bus Stations, Railway Stations, Tourist Attractions, and custom queries).
   - **OSRM Driving Directions**: Open Source Routing Machine computes exact road geometry (`<Polyline>`), driving distance, and estimated travel time without Google Directions.
   - **Haversine Distance**: Straight-line distance computed accurately for each venue (e.g. `500 m`, `1.2 km`).

2. **NearbyAI Assistant (Gemini AI + Smart NLP Fallback)**:
   - Understands conversational requests like:
     - *"Find quiet cafes for studying within 3 km"*
     - *"Find pharmacies open now"*
     - *"Find hospitals near me"*
     - *"Show highly rated restaurants within 5 km"*
   - **Strict Grounding Rule**: The AI converts prompts into structured search parameters (`category`, `radius`, `openNow`, `query`) to fetch verified OpenStreetMap places, and then ranks the actual retrieved places. **The AI strictly never hallucinates or invents fake places**.
   - Built-in heuristic NLP engine ensures full functionality even when offline or before setting an AI API key.

3. **Modern Split-Screen UI**:
   - **Desktop**: Left column with sticky search bar, location trigger, radius slider (1–10 km), category chips, and sortable results list; Right column with full interactive Leaflet map.
   - **Mobile**: Responsive tab toggle between Map and Places list with bottom navigation.

4. **Authentication, Favorites & History**:
   - JWT authentication with bcrypt password hashing (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
   - Bookmarking favorite places saved into MongoDB.
   - Search history audit log with query, radius, coordinates, results count, and timestamps.

---

## 📂 Project Structure

```
nearby-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top header, brand, AI trigger & user auth
│   │   │   ├── SearchBar.jsx        # Debounced Nominatim autocomplete
│   │   │   ├── RadiusSelector.jsx   # 1 km to 10 km interactive selector
│   │   │   ├── FilterPanel.jsx      # Quick category chips with icons
│   │   │   ├── PlaceCard.jsx        # Place card with distance, directions & favorite toggle
│   │   │   ├── PlaceList.jsx        # Scrollable list with distance/name sorting
│   │   │   ├── Map.jsx              # Leaflet MapContainer, OSM tiles, circles & pins
│   │   │   ├── MapMarker.jsx        # Category-based SVG marker pins & rich popups
│   │   │   ├── LocationButton.jsx   # Browser Geolocation API button
│   │   │   ├── RouteLayer.jsx       # Leaflet Polyline displaying OSRM route & ETA
│   │   │   ├── PlaceDetails.jsx     # Detailed modal with full OSM tags & contact info
│   │   │   ├── AIChat.jsx           # Natural-language AI assistant drawer
│   │   │   └── ProtectedRoute.jsx   # Auth guard for favorites and history
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Split-view desktop & mobile dashboard
│   │   │   ├── Login.jsx            # Sign-in page
│   │   │   ├── Register.jsx         # Sign-up page
│   │   │   ├── Favorites.jsx        # User saved places page
│   │   │   └── History.jsx          # Search audit logs page
│   │   │
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance with JWT interceptor
│   │   │   ├── placesService.js     # Places, favorites & history calls
│   │   │   ├── geocodeService.js    # Nominatim forward/reverse geocoding
│   │   │   ├── routingService.js    # OSRM driving routes
│   │   │   └── aiService.js         # Gemini AI search & recommendations
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication React context provider
│   │   │
│   │   ├── App.jsx                  # React Router configuration
│   │   ├── main.jsx                 # Vite React entry point
│   │   └── index.css                # Tailwind directives & Leaflet styling
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                         # Frontend environment variables
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js                    # Mongoose MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js                  # User schema with bcrypt
│   │   ├── Favorite.js              # Saved places schema
│   │   └── SearchHistory.js         # Search history schema
│   │
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile
│   │   ├── placeController.js       # Nearby search, tag search, place details
│   │   ├── aiController.js          # AI query parsing & recommendation ranker
│   │   ├── geocodeController.js     # Nominatim controller
│   │   ├── directionsController.js  # OSRM routing controller
│   │   ├── favoriteController.js    # Favorites CRUD
│   │   └── historyController.js     # Search history CRUD
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── placeRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── geocodeRoutes.js
│   │   ├── directionRoutes.js
│   │   ├── favoriteRoutes.js
│   │   └── historyRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT protection & optional auth
│   │   └── errorMiddleware.js       # Central error handling
│   │
│   ├── services/
│   │   ├── overpassService.js       # Overpass QL builder, multi-mirror failover, caching
│   │   ├── nominatimService.js      # Nominatim API geocoding & caching
│   │   ├── routingService.js        # OSRM routing service
│   │   └── aiService.js             # Google Gemini API & NLP parser fallback
│   │
│   ├── server.js                    # Express server entry point
│   ├── .env                         # Backend environment variables
│   └── package.json
│
├── package.json                     # Root npm script runner
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nearbyai
JWT_SECRET=your_jwt_secret_key_here
AI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```
> **Security Note**: Never expose `AI_API_KEY` or `JWT_SECRET` in the React frontend. All AI and geospatial calls are processed securely by the Express backend.

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher; tested on v24)
- **MongoDB** (running locally or MongoDB Atlas connection URI)
- **npm** (v9 or higher)

### 2. Install Dependencies
Run the install command from the root directory:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```
*(Or install individually: `cd backend && npm install`, then `cd ../frontend && npm install`)*

### 3. Start MongoDB
Make sure your MongoDB server is active. If running locally:
```powershell
# Windows service
net start MongoDB
# Or run mongod directly:
mongod --dbpath <data-directory>
```

### 4. Run the Full Application
Start both the Express backend (port 5000) and the Vite frontend (port 5173) with a single command:
```bash
npm run dev
```

Alternatively, run each service in separate terminals:
- **Terminal 1 (Backend)**:
  ```bash
  cd backend
  npm run dev
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  ```

Open your browser and visit: **`http://localhost:5173`**

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| **GET** | `/api/health` | Service health & active geospatial/AI status | Public |
| **GET** | `/api/geocode/search?q={query}` | Nominatim location autocomplete | Public |
| **GET** | `/api/geocode/reverse?lat={lat}&lng={lng}` | Nominatim reverse geocode | Public |
| **GET** | `/api/places/nearby?lat={lat}&lng={lng}&radius={m}&category={cat}` | OpenStreetMap Overpass POI retrieval | Public / Optional Auth |
| **GET** | `/api/places/search?q={query}&lat={lat}&lng={lng}&radius={m}` | Text query for nearby places | Public |
| **GET** | `/api/places/:id` | Get place by OSM element ID | Public |
| **GET** | `/api/directions?startLat=&startLng=&endLat=&endLng=` | OSRM road coordinates & driving duration | Public |
| **POST** | `/api/ai/search` | Natural language query parsing & OSM search | Public / Optional Auth |
| **POST** | `/api/ai/recommend` | Contextual AI ranking of retrieved OSM places | Public |
| **POST** | `/api/auth/register` | Register new user account | Public |
| **POST** | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| **GET** | `/api/auth/me` | Fetch authenticated user profile | Private (JWT) |
| **GET** | `/api/favorites` | List all saved places for user | Private (JWT) |
| **POST** | `/api/favorites` | Add place to favorites | Private (JWT) |
| **DELETE** | `/api/favorites/:placeId` | Remove place from favorites | Private (JWT) |
| **GET** | `/api/history` | List previous search logs | Private (JWT) |
| **DELETE** | `/api/history/:id` | Delete specific search history entry | Private (JWT) |
| **DELETE** | `/api/history` | Clear entire search history | Private (JWT) |

---

## 🧩 How the Architecture Works Together

```
[ User Browser ]
       │
       ├── 1. Geolocation API ─────────> [ Coordinates (lat, lng) ]
       │
       ├── 2. React-Leaflet Map ───────> [ OpenStreetMap Tiles (Rendered Directly) ]
       │
       ├── 3. Nominatim Location Search ───> [ Express Backend ] ───> [ Nominatim API ]
       │                                                                      │
       │                                     Cache & Format <─────────────────┘
       │
       ├── 4. Category / Keyword Search ───> [ Express Backend ] ───> [ Overpass API (OSM) ]
       │                                                                      │
       │                                     Haversine Sort <─────────────────┘
       │
       ├── 5. "Ask NearbyAI" Assistant ────> [ Express Backend ] ───> [ Gemini AI API ]
       │                                             │                (Convert to JSON intent)
       │                                             ├── Query OSM ──> [ Overpass API ]
       │                                             │                        │
       │                                             └── Rank Real Places <───┘
       │
       ├── 6. "Get Directions" ────────────> [ Express Backend ] ───> [ OSRM Driving Engine ]
       │                                             │
       │    <Polyline> on Leaflet <──────────────────┘ (GeoJSON coordinates + ETA)
       │
       └── 7. Favorites & Search History ──> [ Express Backend ] ───> [ MongoDB Database ]
```

1. **User Geolocation**:
   When the user clicks *"Use My Location"*, the browser Geolocation API captures high-accuracy coordinates. The Leaflet map smoothly flies to that position, places the pulsing user pin, and draws a 1–10 km translucent radius circle.
2. **Nominatim Location Autocomplete**:
   Typing in the search bar sends debounced requests to Nominatim via the backend. Selecting an address (e.g. *"Anna Nagar, Chennai"*) repositions the map and sets the new search epicenter.
3. **Overpass POI Search & Haversine Distance**:
   The backend translates the requested category into Overpass QL clauses (`amenity=restaurant`, `amenity=hospital`, `shop=mall`, etc.). Overpass queries nodes, ways, and relations within the bounding radius. The backend computes the exact Haversine distance, parses opening hours and address details, caches the results in memory, and returns normalized JSON.
4. **Natural-Language AI Processing**:
   When a user asks: *"Find pharmacies open 24/7 within 2 km"*, the prompt is processed by Google Gemini (or the built-in regex NLP engine). The parameters `{ category: 'pharmacy', radius: 2000, openNow: true }` are extracted and sent to Overpass. The retrieved real places are passed back to Gemini, which highlights why each specific place matches the user's intent.
5. **OSRM Turn-by-Turn Routing**:
   Clicking *"Directions"* on any place requests road geometry from OSRM (`router.project-osrm.org`). React-Leaflet renders the driving line using `<Polyline>`, while a floating HUD presents the distance and estimated driving time.
6. **MongoDB Persistence**:
   Users can sign up, log in, manage saved favorite locations, and review their search history with full security via JWT tokens and bcrypt encryption.

---

## 🛡️ Best Practices & Performance Safeguards

- **In-Memory Caching (`node-cache`)**: Repeated searches within a 5–15 minute window are cached on the server to prevent redundant Overpass queries and respect Nominatim rate limits.
- **Overpass Multi-Mirror Failover**: If the primary Overpass server times out or is busy, requests failover automatically to secondary mirrors (`lz4.overpass-api.de`, `overpass.kumi.systems`).
- **Debounced Inputs**: Autocomplete queries are debounced by 450ms.
- **Custom SVG Leaflet Markers**: Replaces default Leaflet PNGs with dynamic SVG DivIcons, eliminating 404 image errors in modern bundlers like Vite and providing instant category color coding.
