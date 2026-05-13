// ============================================
// Servidor Three Reparations
// ============================================
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar conexión y rutas
const { probarConexion } = require('./db/conexion');
const usuarioRoutes = require('./routes/usuarioRoutes');
const productoRoutes = require('./routes/productoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const reparacionRoutes = require('./routes/reparacionRoutes');

const app = express();
const PUERTO = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));



// Rutas de la API
app.use('/api', usuarioRoutes);
app.use('/api', productoRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', reparacionRoutes);

// Iniciar servidor
async function iniciar() {
  const conectado = await probarConexion();
  if (!conectado) process.exit(1);

  app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
  });
}

iniciar();