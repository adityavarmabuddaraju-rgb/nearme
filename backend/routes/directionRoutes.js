import express from 'express';
import { getDirections } from '../controllers/directionsController.js';

const router = express.Router();

router.get('/', getDirections);

export default router;
