const express = require('express');
const router = express.Router();
const reparacionController = require('../controllers/reparacionController');

router.get('/reparaciones', reparacionController.listar);
router.put('/reparaciones/:id/estado', reparacionController.cambiarEstado);
router.delete('/reparaciones/:id', reparacionController.eliminar);

module.exports = router;