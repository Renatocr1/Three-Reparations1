// ============================================
// Controlador de Reparaciones
// Archivo: controllers/reparacionController.js
// ============================================
const Reparacion = require('../models/modeloReparacion');

const ESTADOS_VALIDOS = ['pendiente', 'en_proceso', 'enviado', 'listo', 'entregado', 'cancelado'];

const reparacionController = {

  async listar(req, res) {
    try {
      const reparaciones = await Reparacion.listarTodos();
      return res.json(reparaciones);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al listar reparaciones' });
    }
  },

  async listarPorUsuario(req, res) {
    try {
      const idParam = parseInt(req.params.id, 10);
      if (isNaN(idParam)) {
        console.warn('listarPorUsuario reparaciones: id inválido =', req.params.id);
        return res.status(400).json({ error: 'id de usuario inválido' });
      }
      const reparaciones = await Reparacion.listarPorUsuario(idParam);
      console.log(`Reparaciones encontradas para usuario ${idParam}:`, reparaciones.length);
      return res.json(reparaciones);
    } catch (error) {
      console.error('Error al listar reparaciones del cliente:', error);
      return res.status(500).json({ error: 'Error al listar reparaciones del cliente' });
    }
  },

  async crear(req, res) {
    try {
      const { usuario_id, equipo, descripcion } = req.body || {};

      // Validación clara y sin precedencia rara de operadores
      const idNum = parseInt(usuario_id, 10);
      if (!usuario_id || isNaN(idNum)) {
        return res.status(400).json({ error: 'usuario_id es obligatorio' });
      }
      if (typeof equipo !== 'string' || equipo.trim() === '') {
        return res.status(400).json({ error: 'El dispositivo es obligatorio' });
      }
      if (typeof descripcion !== 'string' || descripcion.trim() === '') {
        return res.status(400).json({ error: 'La causa de reparación es obligatoria' });
      }

      const nuevoId = await Reparacion.crear({
        usuario_id: idNum,
        equipo: equipo.trim(),
        descripcion: descripcion.trim()
      });

      console.log(`Reparación creada id=${nuevoId} para usuario ${idNum}`);
      return res.status(201).json({
        mensaje: 'Reparación solicitada correctamente',
        id: nuevoId
      });
    } catch (error) {
      console.error('Error al crear reparación:', error);
      return res.status(500).json({ error: 'Error al crear reparación' });
    }
  },

  async cambiarEstado(req, res) {
    try {
      const { estado, total } = req.body;
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      const totalNum = (total !== null && total !== undefined && total !== '') ? parseFloat(total) : null;
      console.log(`[PUT reparacion] id=${req.params.id} estado=${estado} total=${totalNum}`);
      const actualizado = await Reparacion.actualizarEstado(req.params.id, estado, totalNum);
      console.log(`[PUT reparacion] affectedRows=${actualizado}`);
      if (!actualizado) return res.status(404).json({ error: 'Reparación no encontrada' });
      return res.json({ mensaje: 'Estado y total actualizados', total: totalNum });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar reparación' });
    }
  },

  async eliminar(req, res) {
    try {
      const eliminado = await Reparacion.eliminar(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Reparación no encontrada' });
      return res.json({ mensaje: 'Reparación eliminada' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar reparación' });
    }
  },



// ¡AÑADE ESTO!
  async actualizar(req, res){
    try {
      const { equipo, descripcion } = req.body;
      const id = req.params.id;

      // Aquí llamas a tu modelo (asegúrate de que Reparacion.actualizar exista en tu modelo)
      const actualizado = await Reparacion.actualizar(id, { equipo, descripcion });
      
      if (!actualizado) return res.status(404).json({ error: 'Reparación no encontrada' });
      return res.json({ mensaje: 'Reparación actualizada con éxito' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar la reparación' });
    }
  }
};
 // Cierre del objeto reparacionController

module.exports = reparacionController;