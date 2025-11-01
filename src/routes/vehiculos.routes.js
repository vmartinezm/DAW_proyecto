import express from 'express';
import {
  getVehiculos,
  getVehiculoById,
  addVehiculo,
  updateVehiculo,
  deleteVehiculo
} from '../controllers/vehiculos.controller.js';

const router = express.Router();

// 📍 Rutas de vehículos

// Obtener todos los vehículos
router.get('/', getVehiculos);

// Obtener un vehículo por ID
router.get('/:id', getVehiculoById);

// Agregar un nuevo vehículo
router.post('/', addVehiculo);

// Actualizar un vehículo existente
router.put('/:id', updateVehiculo);

// Eliminar un vehículo
router.delete('/:id', deleteVehiculo);

export default router;