const express = require('express');
const router = express.Router();
const reparacionController = require('../controllers/reparacionController');

router.get('/reparaciones', reparacionController.listar);
router.get('/reparaciones/usuario/:id', reparacionController.listarPorUsuario);
router.post('/reparaciones', reparacionController.crear);          // NUEVO
router.put('/reparaciones/:id/estado', reparacionController.cambiarEstado);
router.delete('/reparaciones/:id', reparacionController.eliminar);
router.put('/reparaciones/:id', reparacionController.actualizar);


module.exports = router;