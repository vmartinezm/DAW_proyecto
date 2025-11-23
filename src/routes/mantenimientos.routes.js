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

//import { requireAuth } from "../middlewares/auth.middleware.js";
// import { validarMantenimiento } from "../validators/mantenimientos.validator.js"; <-- se activará luego

const router = express.Router();

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
 */
router.post("/", anadirMantenimiento);

/**
 * PUT /mantenimientos/:mantenimiento_id
 * Actualizar un mantenimiento existente
 */
router.put("/:mantenimiento_id", actualizarMantenimiento);

/**
 * DELETE /mantenimientos/:mantenimiento_id
 * Eliminar mantenimiento por ID
 */
router.delete("/:mantenimiento_id", eliminarMantenimiento);

export default router;