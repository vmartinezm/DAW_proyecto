import express from 'express';
import cors from 'cors';
import vehiculosRoutes from './routes/vehiculos.routes.js';
import mantenimientosRoutes from './routes/mantenimientos.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Cargar rutas
app.use('/vehiculos', vehiculosRoutes);
app.use('/mantenimientos', mantenimientosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/clientes', clientesRoutes);

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
