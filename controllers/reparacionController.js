const Reparacion = require('../models/modeloReparacion');

const reparacionController = {

  async listar(req, res) {
    try {
      const reparaciones = await Reparacion.listarTodos();
      res.json(reparaciones);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al listar reparaciones' });
    }
  },

  async cambiarEstado(req, res) {
    try {
      const { estado } = req.body;
      const estadosValidos = ['pendiente', 'en_proceso', 'listo', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      const actualizado = await Reparacion.actualizarEstado(req.params.id, estado);
      if (!actualizado) return res.status(404).json({ error: 'Reparación no encontrada' });
      res.json({ mensaje: 'Estado actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar reparación' });
    }
  },

  async eliminar(req, res) {
    try {
      const eliminado = await Reparacion.eliminar(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Reparación no encontrada' });
      res.json({ mensaje: 'Reparación eliminada' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar reparación' });
    }
  }

};

module.exports = reparacionController;
