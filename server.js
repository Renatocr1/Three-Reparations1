// ============================================
// Servidor Express — Three Reparations
// Archivo: server.js
// ============================================
const express = require('express');
const path = require('path');
const { probarConexion } = require('./db/conexion');

// Rutas
const usuarioRoutes     = require('./routes/UsuarioRoutes');
const reparacionRoutes  = require('./routes/Reparacionroutes');
const pedidoRoutes      = require('./routes/PedidoRoutes');

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos del front (public/) — sin caché para desarrollo
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
  }
}));

// API — todas las rutas se montan bajo /api
// /api/registro, /api/login, /api/usuarios, /api/usuarios/:id, ...
app.use('/api', usuarioRoutes);
// /api/reparaciones, /api/reparaciones/usuario/:id, ...
app.use('/api', reparacionRoutes);
// /api/pedidos, /api/pedidos/usuario/:id, ...
app.use('/api', pedidoRoutes);

// Iniciamos el servidor
(async () => {
  const ok = await probarConexion();
  if (!ok) {
    console.error('No se pudo conectar a la base de datos. Abortando arranque.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('========================================');
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
    console.log('========================================');
  });
})();