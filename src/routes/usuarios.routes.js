import express from "express";

import {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    anadirUsuario,
    actualizarUsuario,
    eliminarUsuario,
} from "../controllers/usuarios.controller.js";

const router = express.Router();

router.get("/", obtenerUsuarios);
router.get("/:user_id", obtenerUsuarioPorId);
router.post("/", anadirUsuario);
router.put("/:user_id", actualizarUsuario);
router.delete("/:user_id", eliminarUsuario);

export default router;