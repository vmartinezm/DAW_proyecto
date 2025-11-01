import express from 'express';
import cors from 'cors';
import vehiculosRoutes from './routes/vehiculos.routes.js';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Cargar rutas
app.use('/vehiculos', vehiculosRoutes);

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
