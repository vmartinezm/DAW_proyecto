/**
 * Archivo principal del servidor Express.
 * Configura middlewares globales, rutas y arranque del servidor.
 */

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Rutas
import vehiculosRoutes from "./routes/vehiculos.routes.js";
import mantenimientosRoutes from "./routes/mantenimientos.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import authRoutes from "./routes/auth.routes.js";

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// ====== MIDDLEWARES GLOBALES ======
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));

// ====== RUTAS ======
app.use("/vehiculos", vehiculosRoutes);
app.use("/mantenimientos", mantenimientosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/auth", authRoutes);

// ====== ARRANCAR SERVIDOR ======
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;