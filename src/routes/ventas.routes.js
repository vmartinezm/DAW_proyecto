/**
 * Rutas relacionadas con la gestión de ventas y reservas
 * @module routes/ventas
 */

import express from "express";
import {
  obtenerVentas,
  obtenerVentaPorId,
  anadirVenta,
  actualizarVenta,
  eliminarVenta,
} from "../controllers/ventas.controller.js";

import { 
  validarVenta,
  validarVentaEdicion,
 } from "../middlewares/validators/ventas.validator.js";


//import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * GET /ventas
 * Obtener todas las ventas (incluye datos de clientes, vehículos y vendedores)
 */
router.get("/", obtenerVentas);

/**
 * GET /ventas/:venta_id
 * Obtener una venta específica por su ID
 */
router.get("/:venta_id", obtenerVentaPorId);

/**
 * POST /ventas
 * Crear una nueva venta o reserva
 * Valida los datos antes de crearla
 */
router.post("/", validarVenta, anadirVenta);

/**
 * PUT /ventas/:venta_id
 * Editar una venta existente
 * Valida los datos antes de actualizarla
 */
router.put("/:venta_id", validarVentaEdicion, actualizarVenta);

/**
 * DELETE /ventas/:venta_id
 * Eliminar una venta por ID
 */
router.delete("/:venta_id", eliminarVenta);

export default router;