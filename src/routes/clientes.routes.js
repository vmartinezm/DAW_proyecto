/**
 * Rutas relacionadas con la gestión de clientes
 * @module routes/clientes
 */

import express from "express";

import {
    obtenerClientes,
    obtenerClientePorDni,
    anadirCliente,
    actualizarCliente,
    eliminarCliente
} from "../controllers/clientes.controller.js";

import {
  validarCliente,
  validarClienteEdicion
} from "../middlewares/validators/clientes.validator.js";

// Importar middleware de autenticación
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Todas las operaciones con clientes requieren login
router.use(verifyToken);

/**
 * GET /clientes
 * Obtener listado completo de clientes
 * Visible para cualquier usuario autenticado
 */
router.get("/", obtenerClientes);

/**
 * GET /clientes/:dni
 * Obtener un cliente por DNI
 * Visible para cualquier usuario autenticado
 */
router.get("/:dni", obtenerClientePorDni);

/**
 * POST /clientes
 * Registrar un nuevo cliente
 * Valida los datos del cliente antes de crear
 */
router.post("/", validarCliente, anadirCliente);

/**
 * PUT /clientes/:dni
 * Editar datos de un cliente existente
 * Valida los datos del cliente antes de actualizar
 */
router.put("/:dni", validarClienteEdicion, actualizarCliente);

/**
 * DELETE /clientes/:dni
 * Eliminar un cliente
 */
router.delete("/:dni", eliminarCliente);

export default router;