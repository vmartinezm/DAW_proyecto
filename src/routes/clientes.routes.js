import express from "express";

import {
    obtenerClientes,
    obtenerClientePorDni,
    anadirCliente,
    actualizarCliente,
    eliminarCliente
} from "../controllers/clientes.controller.js";

const router = express.Router();

router.get("/", obtenerClientes);
router.get("/:dni", obtenerClientePorDni);
router.post("/", anadirCliente);
router.put("/:dni", actualizarCliente);
router.delete("/:dni", eliminarCliente);

export default router;