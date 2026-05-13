const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/productos', productoController.listar);
router.get('/productos/:id', productoController.obtenerPorId);
router.post('/productos', productoController.crear);
router.put('/productos/:id', productoController.actualizar);
router.delete('/productos/:id', productoController.eliminar);

module.exports = router;
