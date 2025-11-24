/**
 * @file src/routes/usuarios.routes.js
 * @description Rutas relacionadas con la gestión de usuarios del sistema
 * Incluye dos niveles de permisos: acceso general para administradores y acceso restringido para usuarios específicos.
 * @module routes/usuarios
 */

// Importar dependencias necesarias
import express from "express";

// Importar controladores de usuarios
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  anadirUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuariosBasic,
} from "../controllers/usuarios.controller.js";

// Importar validadores de usuarios
import {
  validarUsuarioCreacion,
  validarUsuarioEdicion,
} from "../middlewares/validators/usuarios.validator.js";

// Importar middleware de autenticación y autorización
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";

// Crear router de Express
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
 * @route GET /usuarios/:user_id
 * @description Obtener un usuario específico por ID
 * @access Solo admin
 */
router.get("/:user_id", verifyToken, requireAdmin, obtenerUsuarioPorId);

/**
 * @route POST /usuarios
 * @description Crear un nuevo usuario
 * @access Solo admin
 */
router.post(
  "/",
  verifyToken,
  requireAdmin,
  validarUsuarioCreacion,
  anadirUsuario
);

/**
 * @route PUT /usuarios/:user_id
 * @description Actualizar un usuario existente
 * @access Solo admin
 */
router.put(
  "/:user_id",
  verifyToken,
  requireAdmin,
  validarUsuarioEdicion,
  actualizarUsuario
);

/**
 * @route DELETE /usuarios/:user_id
 * @description Eliminar un usuario
 * @access Solo admin
 */
router.delete("/:user_id", verifyToken, requireAdmin, eliminarUsuario);

// Exportar el router
export default router;
