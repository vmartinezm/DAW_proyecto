/**
 * @file clientes.routes.js
 * @description Rutas relacionadas con la gestión de clientes
 * @module routes/clientes
 */

// Importar express
import express from "express";

// Importar controladores de clientes
import {
    obtenerClientes,
    obtenerClientePorDni,
    anadirCliente,
    actualizarCliente,
    eliminarCliente
} from "../controllers/clientes.controller.js";

// Importar validadores de clientes
import {
  validarCliente,
  validarClienteEdicion
} from "../middlewares/validators/clientes.validator.js";

// Importar middleware de autenticación
import { verifyToken } from "../middlewares/auth.middleware.js";

// Crear el router
const router = express.Router();

// Todas las operaciones con clientes requieren login
router.use(verifyToken);

/**
 * @route GET /clientes
 * @description Obtener listado completo de clientes. Visible para cualquier usuario autenticado
 */
router.get("/", obtenerClientes);

/**
 * @route GET /clientes/:dni
 * @description Obtener un cliente por DNI. Visible para cualquier usuario autenticado
 */
router.get("/:dni", obtenerClientePorDni);

/**
 * @route POST /clientes
 * @description Registrar un nuevo cliente. Valida los datos del cliente antes de crear
 */
router.post("/", validarCliente, anadirCliente);

/**
 * @route PUT /clientes/:dni
 * @description Editar datos de un cliente existente. Valida los datos del cliente antes de actualizar
 */
router.put("/:dni", validarClienteEdicion, actualizarCliente);

/**
 * @route DELETE /clientes/:dni
 * @description Eliminar un cliente
 */
router.delete("/:dni", eliminarCliente);

// Exportar el router
export default router;