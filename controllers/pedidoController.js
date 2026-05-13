const Pedido = require('../models/modeloPedido');

const pedidoController = {

  async listar(req, res) {
    try {
      const pedidos = await Pedido.listarTodos();
      res.json(pedidos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al listar pedidos' });
    }
  },

  async cambiarEstado(req, res) {
    try {
      const { estado } = req.body;
      const estadosValidos = ['pendiente', 'enviado', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      const actualizado = await Pedido.actualizarEstado(req.params.id, estado);
      if (!actualizado) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json({ mensaje: 'Estado actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar pedido' });
    }
  },

  async eliminar(req, res) {
    try {
      const eliminado = await Pedido.eliminar(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json({ mensaje: 'Pedido eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar pedido' });
    }
  }

};

module.exports = pedidoController;
