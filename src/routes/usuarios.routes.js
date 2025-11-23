/**
 * Rutas relacionadas con la gestión de usuarios del sistema
 * @module routes/usuarios
 */

import express from "express";
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  anadirUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuarios.controller.js";

import {
  validarUsuarioCreacion,
  validarUsuarioEdicion,
} from "../middlewares/validators/usuarios.validator.js";

// import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";  // se activará después

const router = express.Router();

/**
 * GET /usuarios
 * Obtener todos los usuarios del sistema
 * (SOLO admin debería poder hacer esto — se aplicará con middleware)
 */
router.get("/", obtenerUsuarios);

/**
 * GET /usuarios/:user_id
 * Obtener un usuario específico por ID
 */
router.get("/:user_id", obtenerUsuarioPorId);

/**
 * POST /usuarios
 * Crear un nuevo usuario
 * (SOLO admin — se aplicará luego con requireAdmin)
 */
router.post("/", validarUsuarioCreacion, anadirUsuario);

/**
 * PUT /usuarios/:user_id
 * Actualizar un usuario existente
 * (admin puede actualizar a cualquiera — usuarios normales solo podrán editar su propio perfil)
 */
router.put("/:user_id", validarUsuarioEdicion, actualizarUsuario);

/**
 * DELETE /usuarios/:user_id
 * Eliminar un usuario
 * (SOLO admin)
 */
router.delete("/:user_id", eliminarUsuario);

export default router;
