/**
 * @file src/routes/auth.routes.js
 * @description Rutas de autenticación de usuarios
 * @module routes/auth
 */

// Importar dependencias
import express from "express";

// Importar controlador de autenticación
import { login } from "../controllers/auth.controller.js";

// Crear router
const router = express.Router();

/**
 * @route POST /auth/login
 * @description Inicia sesión del usuario y devuelve token + datos básicos
 * @access Público (única ruta sin auth)
 */
router.post("/login", login);

// Exportar router
export default router;
