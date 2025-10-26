import express from 'express';
import dotenv from 'dotenv';
import vehiculosRoutes from './routes/vehiculos.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use('/vehiculos', vehiculosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚗 Servidor corriendo en http://localhost:${PORT}`);
});
