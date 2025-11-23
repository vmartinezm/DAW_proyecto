/**
 * Rutas relacionadas con la gestión de mantenimientos
 * @module routes/mantenimientos
 */

import express from "express";
import {
  obtenerMantenimientos,
  obtenerMantenimientoPorId,
  anadirMantenimiento,
  actualizarMantenimiento,
  eliminarMantenimiento
} from "../controllers/mantenimientos.controller.js";

import {
  validarMantenimiento,
  validarMantenimientoEdicion
} from "../middlewares/validators/mantenimientos.validator.js";

// Importar middleware de autenticación
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Todas las rutas requieren login
router.use(verifyToken);

/**
 * GET /mantenimientos
 * Obtener todos los mantenimientos
 */
router.get("/", obtenerMantenimientos);

/**
 * GET /mantenimientos/:mantenimiento_id
 * Obtener un mantenimiento por ID
 */
router.get("/:mantenimiento_id", obtenerMantenimientoPorId);

/**
 * POST /mantenimientos
 * Crear un nuevo mantenimiento
 * Valida los datos del mantenimiento antes de crear
 */
router.post("/", validarMantenimiento, anadirMantenimiento);

/**
 * PUT /mantenimientos/:mantenimiento_id
 * Actualizar un mantenimiento existente
 * Valida los datos del mantenimiento antes de actualizar
 */
router.put("/:mantenimiento_id", validarMantenimientoEdicion, actualizarMantenimiento);

/**
 * DELETE /mantenimientos/:mantenimiento_id
 * Eliminar mantenimiento por ID
 */
router.delete("/:mantenimiento_id", eliminarMantenimiento);

export default router;