/**
 * @file usuarios.routes.js
 * Rutas relacionadas con la gestión de usuarios del sistema
 * @module routes/usuarios
 * Incluye dos niveles de permisos: acceso general para administradores y acceso restringido para usuarios específicos.
 */

import express from "express";

import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  anadirUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuariosBasic,
} from "../controllers/usuarios.controller.js";

import {
  validarUsuarioCreacion,
  validarUsuarioEdicion,
} from "../middlewares/validators/usuarios.validator.js";

// Importar middleware de autenticación y autorización
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route GET /usuarios/basic
 * @description Devuelve lista limitada y segura de usuarios
 * @access Cualquier usuario autenticado (token válido)
 */
router.get("/basic", verifyToken, obtenerUsuariosBasic);

/**
 * @route GET /usuarios
 * @description Devuelve lista completa de usuarios
 * @access Solo admin
 */
router.get("/", verifyToken, requireAdmin, obtenerUsuarios);

/**
 * GET /usuarios/:user_id
 * Obtener un usuario específico por ID
 * @access Solo admin
 */
router.get("/:user_id", verifyToken, requireAdmin, obtenerUsuarioPorId);

/**
 * POST /usuarios
 * Crear un nuevo usuario
 * @access Solo admin
 */
router.post("/", verifyToken, requireAdmin, validarUsuarioCreacion, anadirUsuario);

/**
 * PUT /usuarios/:user_id
 * Actualizar un usuario existente
 * @access Solo admin
 */
router.put("/:user_id", verifyToken, requireAdmin, validarUsuarioEdicion, actualizarUsuario);

/**
 * DELETE /usuarios/:user_id
 * Eliminar un usuario
 * @access Solo admin
 */
router.delete("/:user_id", verifyToken, requireAdmin, eliminarUsuario);

export default router;