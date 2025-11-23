/**
 * Rutas de gestión de vehículos.
 * Estas rutas permiten realizar operaciones CRUD sobre la tabla "vehiculos".
 */

import express from "express";
import {
  obtenerVehiculos,
  obtenerVehiculoPorMatricula,
  anadirVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
} from "../controllers/vehiculos.controller.js";

import {
  validarVehiculoPOST,
  validarVehiculoPUT,
} from "../middlewares/validators/vehiculos.validator.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Todas las rutas de vehículos requieren estar autenticado
router.use(verifyToken);

/**
 * @route GET /vehiculos
 * @description Obtener un listado de todos los vehículos
 */
router.get("/", obtenerVehiculos);

/**
 * @route GET /vehiculos/:matricula
 * @description Obtener un vehículo específico por matrícula
 */
router.get("/:matricula", obtenerVehiculoPorMatricula);

/**
 * @route POST /vehiculos
 * @description Crear un nuevo vehículo
 */
router.post("/", validarVehiculoPOST,  anadirVehiculo);

/**
 * @route PUT /vehiculos/:matricula
 * @description Actualizar información de un vehículo
 */
router.put("/:matricula", validarVehiculoPUT, actualizarVehiculo);

/**
 * @route DELETE /vehiculos/:matricula
 * @description Eliminar un vehículo del sistema
 */
router.delete("/:matricula", eliminarVehiculo);

export default router;