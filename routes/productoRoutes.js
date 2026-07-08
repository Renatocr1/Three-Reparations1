// ============================================
// Rutas de Productos (Tienda)
// Archivo: routes/productoRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { soloAdmin } = require('../middleware/auth');

// Catálogo de la tienda: visible para todos
router.get('/productos', productoController.listar);
router.get('/productos/:id', productoController.obtenerPorId);

// Gestión de productos: solo administrador
router.post('/productos', soloAdmin, productoController.crear);
router.put('/productos/:id', soloAdmin, productoController.actualizar);
router.delete('/productos/:id', soloAdmin, productoController.eliminar);

module.exports = router;
