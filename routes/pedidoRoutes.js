// ============================================
// Rutas de Pedidos
// Archivo: routes/pedidoRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { soloAutenticado, soloAdmin } = require('../middleware/auth');

router.get('/pedidos', soloAdmin, pedidoController.listar);
router.get('/pedidos/usuario/:id', soloAutenticado, pedidoController.listarPorUsuario);
router.post('/pedidos', soloAutenticado, pedidoController.crear);
router.put('/pedidos/:id/estado', soloAdmin, pedidoController.cambiarEstado);
router.delete('/pedidos/:id', soloAdmin, pedidoController.eliminar);
router.put('/pedidos/:id', soloAdmin, pedidoController.actualizar);

module.exports = router;
