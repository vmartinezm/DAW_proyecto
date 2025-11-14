import express from "express";
import {
  obtenerMantenimientos,
  obtenerMantenimientoPorId,
  anadirMantenimiento,
  actualizarMantenimiento,
  eliminarMantenimiento
} from "../controllers/mantenimientos.controller.js";

const router = express.Router();

router.get("/", obtenerMantenimientos);
router.get("/:mantenimiento_id", obtenerMantenimientoPorId);
router.post("/", anadirMantenimiento);
router.put("/:mantenimiento_id", actualizarMantenimiento);
router.delete("/:mantenimiento_id", eliminarMantenimiento);

export default router;
