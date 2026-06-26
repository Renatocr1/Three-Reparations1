// ============================================
// Rutas de Usuarios
// Archivo: routes/usuarioRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/UsuarioController');
const { soloAdmin } = require('../middleware/auth');

// Registro, login y logout (públicos / sesión propia)
router.post('/registro', usuarioController.registrar);
router.post('/login',    usuarioController.login);
router.post('/logout',   usuarioController.logout);

// Administración de usuarios (solo administrador)
router.get('/usuarios/estadisticas', soloAdmin, usuarioController.obtenerEstadisticas);
router.get('/usuarios',              soloAdmin, usuarioController.listar);
router.get('/usuarios/:id',          soloAdmin, usuarioController.obtenerPorId);
router.delete('/usuarios/:id',       soloAdmin, usuarioController.eliminar);

module.exports = router;
