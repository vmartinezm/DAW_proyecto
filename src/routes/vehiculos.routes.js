import express from 'express';
import {
  obtenerVehiculos,
  obtenerVehiculoPorMatricula,
  anadirVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
} from '../controllers/vehiculos.controller.js';

const router = express.Router();

// 📍 Rutas de vehículos

// Obtener todos los vehículos
router.get('/', obtenerVehiculos);

// Obtener un vehículo por matrícula
router.get('/:matricula', obtenerVehiculoPorMatricula);

// Agregar un nuevo vehículo
router.post('/', anadirVehiculo);

// Actualizar un vehículo existente por matrícula
router.put('/:matricula', actualizarVehiculo);

// Eliminar un vehículo por matrícula
router.delete('/:matricula', eliminarVehiculo);

export default router;
