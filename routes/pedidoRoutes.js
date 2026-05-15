const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/pedidos', pedidoController.listar);
router.get('/pedidos/usuario/:id', pedidoController.listarPorUsuario);
router.post('/pedidos', pedidoController.crear);              // NUEVA
router.put('/pedidos/:id/estado', pedidoController.cambiarEstado);
router.delete('/pedidos/:id', pedidoController.eliminar);

module.exports = router;