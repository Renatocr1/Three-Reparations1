// ============================================
// Rutas de Usuarios
// Archivo: routes/usuarioRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/UsuarioController');

// POST /api/registro
router.post('/registro', usuarioController.registrar);

// POST /api/login
router.post('/login', usuarioController.login);

// GET /api/usuarios/estadisticas  <-- IMPORTANTE: va ANTES de /usuarios/:id
router.get('/usuarios/estadisticas', usuarioController.obtenerEstadisticas);

// GET /api/usuarios
router.get('/usuarios', usuarioController.listar);

// GET /api/usuarios/:id
router.get('/usuarios/:id', usuarioController.obtenerPorId);

// DELETE /api/usuarios/:id
router.delete('/usuarios/:id', usuarioController.eliminar);

module.exports = router;
