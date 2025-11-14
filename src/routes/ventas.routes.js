import express from "express";

import {
  obtenerVentas,
  obtenerVentaPorId,
  anadirVenta,
  actualizarVenta,
  eliminarVenta,
} from "../controllers/ventas.controller.js";

// (Opcional) Middleware de autenticación / autorización
// Este middleware puedes implementarlo luego en `middlewares/auth.js`
// Ejemplo de funciones:
//   verificarToken -> comprueba JWT válido
//   verificarRol('admin') -> limita acceso según rol
//
// import { verificarToken, verificarRol } from "../middlewares/auth.js";

const router = express.Router();

/* 
  🔒 NOTA: por ahora las rutas están abiertas.
  Cuando actives autenticación, podrás usarlas así:
  
  router.get("/", verificarToken, obtenerVentas);
  router.post("/", verificarToken, verificarRol(["admin", "empleado"]), anadirVenta);
*/

router.get("/", obtenerVentas); // Obtener todas las ventas
router.get("/:venta_id", obtenerVentaPorId); // Obtener una venta por ID
router.post("/", anadirVenta); // Crear una nueva venta
router.put("/:venta_id", actualizarVenta); // Actualizar una venta existente
router.delete("/:venta_id", eliminarVenta); // Eliminar una venta

export default router;
