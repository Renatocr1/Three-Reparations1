// ============================================
// Servidor Express — Three Reparations
// Archivo: server.js
// ============================================
const express = require('express');
const session = require('express-session');
const path = require('path');
const { probarConexion } = require('./db/conexion');

// Rutas (los nombres deben coincidir EXACTO con el archivo: Linux distingue mayúsculas)
const usuarioRoutes     = require('./routes/usuarioRoutes');
const reparacionRoutes  = require('./routes/Reparacionroutes');
const pedidoRoutes      = require('./routes/pedidoRoutes');
const productoRoutes    = require('./routes/productoRoutes');
const servicioRoutes    = require('./routes/servicioRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesión: guarda al usuario tras el login para el control de acceso por rol
app.use(session({
  secret: process.env.SESSION_SECRET || 'three-reparations-secret-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 4 // 4 horas
  }
}));

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
// /api/productos, /api/productos/:id, ...
app.use('/api', productoRoutes);
// /api/servicios, /api/servicios/:id, ...
app.use('/api', servicioRoutes);

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