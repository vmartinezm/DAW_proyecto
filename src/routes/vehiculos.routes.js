import express from 'express';
import { getVehiculos, addVehiculo } from '../controllers/vehiculos.controller.js';

const router = express.Router();

// Rutas
router.get('/', getVehiculos);
router.post('/', addVehiculo);

export default router;
