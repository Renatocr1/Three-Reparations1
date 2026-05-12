// ============================================
// Servidor P2 Web - Con Model, Controller y Routes
// Archivo: server.js
// ============================================
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar conexión y rutas
const { probarConexion } = require('./db/conexion');
const usuarioRoutes = require('./routes/usuarioRoutes');
/* const reparacionRoutes = require('./routes/reparacionRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes'); */

const app = express();
const PUERTO = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Rutas de la API (todas bajo /api)
app.use('/api', usuarioRoutes);
/* app.use('/api', reparacionRoutes);
app.use('/api/catalogo', catalogoRoutes); */

// Iniciar servidors
async function iniciar() {
  const conectado = await probarConexion();
  if (!conectado) process.exit(1);

  app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
  });
}

iniciar();
