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

// import { requireAuth, requireAdminOrSelf } from "../middlewares/auth.middleware.js";
// import { validarCliente } from "../validators/clientes.validator.js";

const router = express.Router();

/**
 * GET /clientes
 * Obtener listado completo de clientes
 * (Visible para empleados y admin)
 */
router.get("/", obtenerClientes);

/**
 * GET /clientes/:dni
 * Obtener un cliente por DNI
 */
router.get("/:dni", obtenerClientePorDni);

/**
 * POST /clientes
 * Registrar un nuevo cliente
 */
router.post("/", anadirCliente);

/**
 * PUT /clientes/:dni
 * Editar datos de un cliente existente
 */
router.put("/:dni", actualizarCliente);

/**
 * DELETE /clientes/:dni
 * Eliminar un cliente
 */
router.delete("/:dni", eliminarCliente);

export default router;