const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/pedidos', pedidoController.listar);
router.put('/pedidos/:id/estado', pedidoController.cambiarEstado);
router.delete('/pedidos/:id', pedidoController.eliminar);

module.exports = router;
