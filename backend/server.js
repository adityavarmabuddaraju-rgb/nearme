import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import placeRoutes from './routes/placeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import geocodeRoutes from './routes/geocodeRoutes.js';
import directionRoutes from './routes/directionRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Ensure outgoing HTTPS requests (OSM, Nominatim, Overpass, OSRM) succeed on Windows/corporate proxy environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Global error handlers to keep process resilient
process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
});

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NearbyAI API',
    timestamp: new Date().toISOString(),
    geospatialEngine: 'OpenStreetMap / Overpass / Nominatim / OSRM',
    aiEngine: process.env.AI_API_KEY ? 'Gemini AI active' : 'NLP Heuristic active',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/directions', directionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/history', historyRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[NearbyAI Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[NearbyAI Server] Health endpoint: http://localhost:${PORT}/api/health`);
});
