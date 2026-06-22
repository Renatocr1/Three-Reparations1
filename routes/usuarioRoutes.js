// ============================================
// Rutas de Usuarios
// Archivo: routes/UsuarioRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/UsuarioController');

// Registro y login (sin /usuarios delante porque el front llama directo a /api/registro)
router.post('/registro', usuarioController.registrar);
router.post('/login',    usuarioController.login);

// Administración de usuarios
router.get('/usuarios/estadisticas', usuarioController.obtenerEstadisticas);
router.get('/usuarios',              usuarioController.listar);
router.get('/usuarios/:id',          usuarioController.obtenerPorId);
router.delete('/usuarios/:id',       usuarioController.eliminar);

module.exports = router;