// ============================================
// Rutas de Servicios del taller
// Archivo: routes/servicioRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const { soloAdmin } = require('../middleware/auth');

// Catálogo: lo puede ver cualquiera (cliente para pedir cita)
router.get('/servicios', servicioController.listar);
router.get('/servicios/:id', servicioController.obtenerPorId);

// Gestión del catálogo: solo administrador (RF-033 a RF-035)
router.post('/servicios', soloAdmin, servicioController.crear);
router.put('/servicios/:id', soloAdmin, servicioController.actualizar);
router.put('/servicios/:id/activo', soloAdmin, servicioController.cambiarActivo);

module.exports = router;
