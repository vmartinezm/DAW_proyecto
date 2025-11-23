/**
 * Rutas de autenticación de usuarios
 * @module routes/auth
 */

import express from "express";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @route POST /auth/login
 * @description Inicia sesión del usuario y devuelve token + datos básicos
 * @access Público (única ruta sin auth)
 */
router.post("/login", login);

export default router;