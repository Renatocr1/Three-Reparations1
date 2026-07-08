const express = require('express');
const router = express.Router();
const reparacionController = require('../controllers/reparacionController');
const { soloAutenticado, soloAdmin } = require('../middleware/auth');

// Listado completo y gestión: solo administrador
router.get('/reparaciones', soloAdmin, reparacionController.listar);

// Reparaciones del propio cliente
router.get('/reparaciones/usuario/:id', soloAutenticado, reparacionController.listarPorUsuario);

// Historial y diagnóstico (más específicas van antes de /:id)
router.get('/reparaciones/:id/historial', soloAutenticado, reparacionController.obtenerHistorial);
router.get('/reparaciones/:id/diagnostico', soloAutenticado, reparacionController.obtenerDiagnostico);
router.put('/reparaciones/:id/diagnostico', soloAdmin, reparacionController.guardarDiagnostico);

router.get('/reparaciones/:id', soloAutenticado, reparacionController.obtener);

// Crear cita: cualquier usuario autenticado (cliente)
router.post('/reparaciones', soloAutenticado, reparacionController.crear);

// Acciones de administración
router.put('/reparaciones/:id/estado', soloAdmin, reparacionController.cambiarEstado);
router.delete('/reparaciones/:id', soloAdmin, reparacionController.eliminar);
router.put('/reparaciones/:id', soloAdmin, reparacionController.actualizar);

module.exports = router;
