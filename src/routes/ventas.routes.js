/**
 * @file ventas.routes.js
 * @description Rutas relacionadas con la gestión de ventas y reservas
 * @module routes/ventas
 */

// Importar dependencias
import express from "express";

// Importar controladores
import {
  obtenerVentas,
  obtenerVentaPorId,
  anadirVenta,
  actualizarVenta,
  eliminarVenta,
} from "../controllers/ventas.controller.js";

// Importar validadores
import {
  validarVenta,
  validarVentaEdicion,
} from "../middlewares/validators/ventas.validator.js";

// Importar middleware de autenticación
import { verifyToken } from "../middlewares/auth.middleware.js";

// Crear el router
const router = express.Router();

// Todas las rutas de ventas requieren estar logueado
router.use(verifyToken);

/**
 * @route GET /ventas
 * @description Obtener todas las ventas (incluye datos de clientes, vehículos y vendedores)
 */
router.get("/", obtenerVentas);

/**
 * @route GET /ventas/:venta_id
 * @description Obtener una venta específica por su ID
 */
router.get("/:venta_id", obtenerVentaPorId);

/**
 * @route POST /ventas
 * @description Crear una nueva venta o reserva
 * Valida los datos antes de crearla
 */
router.post("/", validarVenta, anadirVenta);

/**
 * @route PUT /ventas/:venta_id
 * @description Editar una venta existente
 * Valida los datos antes de actualizarla
 */
router.put("/:venta_id", validarVentaEdicion, actualizarVenta);

/**
 * @route DELETE /ventas/:venta_id
 * @description Eliminar una venta por ID
 */
router.delete("/:venta_id", eliminarVenta);

// Exportar el router
export default router;
