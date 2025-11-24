/**
 * @file src/routes/mantenimientos.routes.js
 * @description Rutas relacionadas con la gestión de mantenimientos
 * @module routes/mantenimientos
 */

// Importar dependencias
import express from "express";

// Importar controladores
import {
  obtenerMantenimientos,
  obtenerMantenimientoPorId,
  anadirMantenimiento,
  actualizarMantenimiento,
  eliminarMantenimiento,
} from "../controllers/mantenimientos.controller.js";

// Importar validadores
import {
  validarMantenimiento,
  validarMantenimientoEdicion,
} from "../middlewares/validators/mantenimientos.validator.js";

// Importar middleware de autenticación
import { verifyToken } from "../middlewares/auth.middleware.js";

// Crear el router
const router = express.Router();

// Todas las rutas requieren login
router.use(verifyToken);

/**
 * @route GET /mantenimientos
 * @description Obtener todos los mantenimientos
 */
router.get("/", obtenerMantenimientos);

/**
 * @route GET /mantenimientos/:mantenimiento_id
 * @description Obtener un mantenimiento por ID
 */
router.get("/:mantenimiento_id", obtenerMantenimientoPorId);

/**
 * @route POST /mantenimientos
 * @description Crear un nuevo mantenimiento
 * Valida los datos del mantenimiento antes de crear
 */
router.post("/", validarMantenimiento, anadirMantenimiento);

/**
 * @route PUT /mantenimientos/:mantenimiento_id
 * @description Actualizar un mantenimiento existente
 * Valida los datos del mantenimiento antes de actualizar
 */
router.put(
  "/:mantenimiento_id",
  validarMantenimientoEdicion,
  actualizarMantenimiento
);

/**
 * @route DELETE /mantenimientos/:mantenimiento_id
 * @description Eliminar mantenimiento por ID
 */
router.delete("/:mantenimiento_id", eliminarMantenimiento);

// Exportar el router
export default router;
