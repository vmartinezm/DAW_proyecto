import express from "express";

import {
  obtenerVentas,
  obtenerVentaPorId,
  anadirVenta,
  actualizarVenta,
  eliminarVenta,
} from "../controllers/ventas.controller.js";

const router = express.Router();

router.get("/", obtenerVentas); // Obtener todas las ventas
router.get("/:venta_id", obtenerVentaPorId); // Obtener una venta por ID
router.post("/", anadirVenta); // Crear una nueva venta
router.put("/:venta_id", actualizarVenta); // Actualizar una venta existente
router.delete("/:venta_id", eliminarVenta); // Eliminar una venta

export default router;
