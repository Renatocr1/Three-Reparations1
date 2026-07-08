// ============================================
// Controlador de Servicios del taller
// Archivo: controllers/servicioController.js
// ============================================
const Servicio = require('../models/modeloServicio');

const servicioController = {

  // GET /api/servicios            -> catálogo activo (cliente)
  // GET /api/servicios?todos=1    -> todos (solo admin, para gestión)
  async listar(req, res) {
    try {
      const esAdmin = req.session && req.session.usuario && req.session.usuario.rol === 'admin';
      const servicios = (req.query.todos === '1' && esAdmin)
        ? await Servicio.listarTodos()
        : await Servicio.listarActivos();
      return res.json(servicios);
    } catch (error) {
      console.error('Error al listar servicios:', error);
      return res.status(500).json({ error: 'Error al listar servicios' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const servicio = await Servicio.buscarPorId(req.params.id);
      if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.json(servicio);
    } catch (error) {
      console.error('Error al obtener servicio:', error);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  async crear(req, res) {
    try {
      const { nombre, descripcion, categoria, precio, dias_estimados } = req.body || {};
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del servicio es obligatorio' });
      }
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número válido' });
      }
      const id = await Servicio.crear({
        nombre: nombre.trim(),
        descripcion,
        categoria,
        precio: precioNum,
        dias_estimados: parseInt(dias_estimados, 10) || 1
      });
      return res.status(201).json({ mensaje: 'Servicio creado', id });
    } catch (error) {
      console.error('Error al crear servicio:', error);
      return res.status(500).json({ error: 'Error al crear servicio' });
    }
  },

  async actualizar(req, res) {
    try {
      const { nombre, descripcion, categoria, precio, dias_estimados, activo } = req.body || {};
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del servicio es obligatorio' });
      }
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número válido' });
      }
      const actualizado = await Servicio.actualizar(req.params.id, {
        nombre: nombre.trim(),
        descripcion,
        categoria,
        precio: precioNum,
        dias_estimados: parseInt(dias_estimados, 10) || 1,
        activo: activo === undefined ? 1 : activo
      });
      if (!actualizado) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.json({ mensaje: 'Servicio actualizado' });
    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      return res.status(500).json({ error: 'Error al actualizar servicio' });
    }
  },

  // PUT /api/servicios/:id/activo  -> activar / desactivar (RF-035)
  async cambiarActivo(req, res) {
    try {
      const activo = req.body && req.body.activo ? 1 : 0;
      const ok = await Servicio.cambiarActivo(req.params.id, activo);
      if (!ok) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.json({ mensaje: activo ? 'Servicio activado' : 'Servicio desactivado' });
    } catch (error) {
      console.error('Error al cambiar estado del servicio:', error);
      return res.status(500).json({ error: 'Error al cambiar estado del servicio' });
    }
  }

};

module.exports = servicioController;
