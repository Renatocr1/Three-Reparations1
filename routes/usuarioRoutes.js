// ============================================
// Rutas de Usuarios
// Archivo: routes/usuarioRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// POST /api/registro
router.post('/registro', usuarioController.registrar);

// POST /api/login
router.post('/login', usuarioController.login);

// GET /api/usuarios
router.get('/usuarios', usuarioController.listar);

// GET /api/usuarios/:id
router.get('/usuarios/:id', usuarioController.obtenerPorId);

// DELETE /api/usuarios/:id
router.delete('/usuarios/:id', usuarioController.eliminar);

module.exports = router;
